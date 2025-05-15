from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentCreateSerializer
from payments.models import PaymentDetail  # Import from payments app
from payments.serializers import PaymentDetailSerializer  # Import from payments app
from profiles.models import PsychologistProfile, ClientProfile
from pricing.models import PsychologistPrice  # Add this import
from schedules.models import Schedule
from authentication.permissions import IsClient, IsPsychologist, IsAdminUser
from rest_framework import serializers
import os
from django.http import HttpResponse
from backend.email_utils import (
    send_appointment_created_client_email,
    send_appointment_created_psychologist_email,
    send_payment_verification_needed_email
)
from django.conf import settings

class AppointmentViewSet(viewsets.ModelViewSet):
    """API endpoint para gestión de citas"""
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'admin':
            return Appointment.objects.all()
        elif user.user_type == 'psychologist':
            try:
                psychologist = PsychologistProfile.objects.get(user=user)
                return Appointment.objects.filter(psychologist=psychologist)
            except PsychologistProfile.DoesNotExist:
                return Appointment.objects.none()
        elif user.user_type == 'client':
            try:
                client = ClientProfile.objects.get(user=user)
                return Appointment.objects.filter(client=client)
            except ClientProfile.DoesNotExist:
                return Appointment.objects.none()
        
        return Appointment.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AppointmentCreateSerializer
        return AppointmentSerializer
    
    # In the AppointmentViewSet class
    
    def perform_create(self, serializer):
        """
        Override perform_create to set the client and payment amount.
        """
        user = self.request.user
        try:
            client = ClientProfile.objects.get(user=user)
        except ClientProfile.DoesNotExist:
            raise serializers.ValidationError("No se encontró el perfil de cliente para este usuario.")
        
        # Get the psychologist
        psychologist = serializer.validated_data['psychologist']
        
        # Get the price using the method
        try:
            # Try to get the approved price for the psychologist
            price_obj = PsychologistPrice.objects.filter(
                psychologist=psychologist, 
                is_approved=True
            ).first()
            
            if price_obj:
                price = price_obj.price
            else:
                # Fallback to default price if no approved price exists
                price = 0
        except Exception as e:
            print(f"Error getting price: {str(e)}")
            price = 0
        
        # Extract payment_method if it exists in the validated data
        payment_method = None
        if 'payment_method' in serializer.validated_data:
            payment_method = serializer.validated_data.pop('payment_method')
        
        # Asegurarse de que la fecha se mantenga como está sin conversión de zona horaria
        # Esto evita el problema de que la fecha se almacene un día después
        date = serializer.validated_data.get('date')
        
        # Save the appointment with the client and price
        appointment = serializer.save(
            client=client,
            payment_amount=price,
            status='PENDING_PAYMENT'
        )
        
        # If payment_method was provided, create a PaymentDetail
        if payment_method:
            try:
                PaymentDetail.objects.create(
                    appointment=appointment,
                    payment_method=payment_method
                )
            except Exception as e:
                print(f"Error creating payment detail: {str(e)}")
                # Don't fail the appointment creation if payment detail creation fails
        
        # Determinar si es primera cita
        is_first_appointment = Appointment.objects.filter(
            client=client,
            psychologist=psychologist
        ).exclude(pk=appointment.pk).exists() == False
        
        # Enviar correo al cliente con instrucciones de pago
        try:
            # Obtener la información de pago desde settings o configuración
            payment_info = getattr(settings, 'PAYMENT_INFO', {
                'nombre_destinatario': 'E-Mind SpA',
                'rut_destinatario': '77.777.777-7',
                'banco_destinatario': 'Banco Estado',
                'tipo_cuenta': 'Cuenta Corriente',
                'numero_cuenta': '12345678',
                'correo_destinatario': 'pagos@emindapp.cl'
            })
            
            send_appointment_created_client_email(appointment, payment_info)
            print(f"✅ Correo de cita agendada enviado al cliente: {client.user.email}")
        except Exception as e:
            print(f"❌ Error al enviar correo al cliente: {str(e)}")
        
        # Enviar correo al psicólogo
        try:
            send_appointment_created_psychologist_email(appointment, is_first_appointment)
            print(f"✅ Correo de cita agendada enviado al psicólogo: {psychologist.user.email}")
        except Exception as e:
            print(f"❌ Error al enviar correo al psicólogo: {str(e)}")
        
        return appointment
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsClient])
    def available_slots(self, request):
        """Endpoint para obtener los horarios disponibles de un psicólogo"""
        psychologist_id = request.query_params.get('psychologist_id')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        if not psychologist_id:
            return Response(
                {"detail": "Se requiere el ID del psicólogo."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            psychologist = PsychologistProfile.objects.get(id=psychologist_id)
            
            # Parse dates or use defaults (current week)
            today = timezone.now().date()
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else today
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else (today + timedelta(days=14))
            except ValueError:
                return Response(
                    {"detail": "Formato de fecha inválido. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the psychologist's schedule
            schedules = Schedule.objects.filter(psychologist=psychologist)
            
            # Get existing appointments
            existing_appointments = Appointment.objects.filter(
                psychologist=psychologist,
                date__gte=start_date,
                date__lte=end_date,
                status__in=['PAYMENT_VERIFIED', 'CONFIRMED', 'PAYMENT_UPLOADED']
            )
            
            # Generate available slots
            available_slots = []
            current_date = start_date
            
            while current_date <= end_date:
                day_name = current_date.strftime('%A').upper()
                day_schedules = schedules.filter(day_of_week=day_name)
                
                day_slots = []
                for schedule in day_schedules:
                    # Generate hourly slots within this schedule
                    slot_start = schedule.start_time
                    while slot_start < schedule.end_time:
                        slot_end = (
                            datetime.combine(today, slot_start) + timedelta(hours=1)
                        ).time()
                        
                        # Check if this slot overlaps with any existing appointment
                        is_available = True
                        for appointment in existing_appointments:
                            if (
                                appointment.date == current_date and
                                appointment.start_time < slot_end and
                                appointment.end_time > slot_start
                            ):
                                is_available = False
                                break
                        
                        if is_available:
                            day_slots.append({
                                "start_time": slot_start.strftime('%H:%M'),
                                "end_time": slot_end.strftime('%H:%M')
                            })
                        
                        # Move to next slot
                        slot_start = slot_end
                
                if day_slots:
                    available_slots.append({
                        "date": current_date.strftime('%Y-%m-%d'),
                        "day_name": current_date.strftime('%A'),
                        "slots": day_slots
                    })
                
                current_date += timedelta(days=1)
            
            return Response({
                "psychologist_id": psychologist.id,
                "psychologist_name": psychologist.user.get_full_name(),
                "available_slots": available_slots
            })
            
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": "No se encontró el perfil del psicólogo."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsClient])
    def upload_payment(self, request, pk=None):
        """Endpoint para que el cliente suba el comprobante de pago"""
        try:
            appointment = self.get_object()
            
            # Verify the appointment belongs to the requesting client
            user = request.user
            try:
                client = ClientProfile.objects.get(user=user)
                if appointment.client != client:
                    return Response(
                        {"detail": "No tiene permiso para modificar esta cita."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except ClientProfile.DoesNotExist:
                return Response(
                    {"detail": "No se encontró el perfil de cliente."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if the appointment is in the correct state
            if appointment.status != 'PENDING_PAYMENT':
                return Response(
                    {"detail": f"No se puede subir el comprobante. Estado actual: {appointment.get_status_display()}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get payment details
            payment_proof = request.FILES.get('payment_proof')
            transaction_id = request.data.get('transaction_id')
            payment_date = request.data.get('payment_date')
            payment_method = request.data.get('payment_method')
            
            if not payment_proof:
                return Response(
                    {"detail": "Se requiere el comprobante de pago."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create a custom upload path for the payment proof
            # Format: client_payment_proofs/client_id/appointment_id/filename
            original_filename = payment_proof.name
            file_extension = original_filename.split('.')[-1] if '.' in original_filename else ''
            new_filename = f"comprobante_{appointment.id}.{file_extension}" if file_extension else f"comprobante_{appointment.id}"
            
            # Set the new path and filename
            upload_path = f"client_payment_proofs/{client.id}/{appointment.id}/{new_filename}"
            payment_proof.name = upload_path
            
            # Update appointment
            appointment.payment_proof = payment_proof
            appointment.status = 'PAYMENT_UPLOADED'
            appointment.save()
            
            # Update payment details
            payment_detail, created = PaymentDetail.objects.get_or_create(appointment=appointment)
            payment_detail.transaction_id = transaction_id
            payment_detail.payment_method = payment_method
            
            if payment_date:
                try:
                    payment_detail.payment_date = datetime.strptime(payment_date, '%Y-%m-%d %H:%M')
                except ValueError:
                    pass
            
            payment_detail.save()
            
            # Enviar correo al psicólogo para notificarle que debe verificar el pago
            try:
                # Obtener URL del frontend desde settings o configuración
                frontend_url = getattr(settings, 'FRONTEND_URL', 'https://emindapp.cl')
                
                send_payment_verification_needed_email(appointment, frontend_url)
                print(f"✅ Correo de verificación de pago enviado al psicólogo: {appointment.psychologist.user.email}")
            except Exception as e:
                print(f"❌ Error al enviar correo de verificación al psicólogo: {str(e)}")
            
            return Response({
                "detail": "Comprobante de pago subido correctamente. Un administrador verificará el pago pronto."
            })
            
        except Appointment.DoesNotExist:
            return Response(
                {"detail": "No se encontró la cita."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminUser])
    def verify_payment(self, request, pk=None):
        """Endpoint para que el administrador verifique el pago"""
        try:
            appointment = self.get_object()
            
            # Check if the appointment is in the correct state
            if appointment.status != 'PAYMENT_UPLOADED':
                return Response(
                    {"detail": f"No se puede verificar el pago. Estado actual: {appointment.get_status_display()}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update appointment status
            appointment.status = 'PAYMENT_VERIFIED'
            appointment.payment_verified_by = request.user
            appointment.save()
            
            # Add admin notes if provided
            admin_notes = request.data.get('admin_notes')
            if admin_notes:
                appointment.admin_notes = admin_notes
                appointment.save()
            
            return Response({
                "detail": "Pago verificado correctamente. La cita ha sido confirmada."
            })
            
        except Appointment.DoesNotExist:
            return Response(
                {"detail": "No se encontró la cita."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsClient])
    def create_with_payment(self, request):
        """Endpoint para crear una cita con método de pago"""
        serializer = AppointmentCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            
            if user.user_type != 'client':
                return Response(
                    {"detail": "Solo los clientes pueden agendar citas."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            try:
                client = ClientProfile.objects.get(user=user)
                
                # Get the psychologist's price
                psychologist = serializer.validated_data['psychologist']
                price = psychologist.session_price or 0
                
                # Get payment method
                payment_method = serializer.validated_data.pop('payment_method', None)
                
                # Save the appointment with the client and price
                appointment = serializer.save(
                    client=client,
                    payment_amount=price,
                    status='PENDING_PAYMENT'
                )
                
                # Create payment detail with payment method
                payment_detail = PaymentDetail.objects.create(
                    appointment=appointment,
                    payment_method=payment_method
                )
                
                # Return the created appointment
                return Response(
                    AppointmentSerializer(appointment).data,
                    status=status.HTTP_201_CREATED
                )
                
            except ClientProfile.DoesNotExist:
                return Response(
                    {"detail": "No se encontró el perfil de cliente."},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='psychologist/(?P<psychologist_id>[^/.]+)')
    def psychologist_appointments(self, request, psychologist_id=None):
        """Endpoint para obtener las citas de un psicólogo específico"""
        try:
            # Verify the psychologist exists
            psychologist = PsychologistProfile.objects.get(id=psychologist_id)
            
            # Get appointments for this psychologist
            appointments = Appointment.objects.filter(
                psychologist=psychologist,
                # Filter by status to only include active appointments
                status__in=['PENDING_PAYMENT', 'PAYMENT_UPLOADED', 'PAYMENT_VERIFIED', 'CONFIRMED']
            )
            
            serializer = self.get_serializer(appointments, many=True)
            return Response(serializer.data)
            
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": "No se encontró el perfil del psicólogo."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": f"Error al obtener las citas: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='my-appointments', permission_classes=[permissions.IsAuthenticated, IsPsychologist])
    def my_appointments(self, request):
        """Endpoint para que el psicólogo vea sus citas"""
        user = request.user
        try:
            psychologist = PsychologistProfile.objects.get(user=user)
            
            # Filtrar por fecha si se proporciona
            start_date_str = request.query_params.get('start_date')
            end_date_str = request.query_params.get('end_date')
            status_filter = request.query_params.get('status')
            
            # Iniciar con todas las citas del psicólogo
            queryset = Appointment.objects.filter(psychologist=psychologist)
            
            # Aplicar filtros si se proporcionan
            if start_date_str:
                try:
                    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                    queryset = queryset.filter(date__gte=start_date)
                except ValueError:
                    return Response(
                        {"detail": "Formato de fecha de inicio inválido. Use YYYY-MM-DD."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            if end_date_str:
                try:
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                    queryset = queryset.filter(date__lte=end_date)
                except ValueError:
                    return Response(
                        {"detail": "Formato de fecha de fin inválido. Use YYYY-MM-DD."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            # Ordenar por fecha y hora
            queryset = queryset.order_by('date', 'start_time')
            
            # Paginar resultados
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
            
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": "No se encontró el perfil de psicólogo para este usuario."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated, IsPsychologist])
    def update_status(self, request, pk=None):
        """Endpoint para que el psicólogo actualice el estado de una cita"""
        try:
            appointment = self.get_object()
            
            # Verificar que la cita pertenece al psicólogo que hace la solicitud
            user = request.user
            try:
                psychologist = PsychologistProfile.objects.get(user=user)
                if appointment.psychologist != psychologist:
                    return Response(
                        {"detail": "No tiene permiso para modificar esta cita."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except PsychologistProfile.DoesNotExist:
                return Response(
                    {"detail": "No se encontró el perfil de psicólogo."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Obtener el nuevo estado
            new_status = request.data.get('status')
            
            # Validar que el estado es válido
            valid_statuses = ['CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
            if not new_status or new_status not in valid_statuses:
                return Response(
                    {"detail": f"Estado no válido. Opciones permitidas: {', '.join(valid_statuses)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar transiciones de estado permitidas
            if appointment.status not in ['PAYMENT_VERIFIED', 'CONFIRMED']:
                return Response(
                    {"detail": f"No se puede actualizar el estado desde '{appointment.get_status_display()}'."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Actualizar el estado
            appointment.status = new_status
            appointment.save()
            
            return Response({
                "detail": f"Estado actualizado a '{appointment.get_status_display()}'."
            })
            
        except Appointment.DoesNotExist:
            return Response(
                {"detail": "No se encontró la cita."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated, IsPsychologist])
    def add_notes(self, request, pk=None):
        """Endpoint para que el psicólogo añada notas a una cita"""
        try:
            appointment = self.get_object()
            
            # Verificar que la cita pertenece al psicólogo que hace la solicitud
            user = request.user
            try:
                psychologist = PsychologistProfile.objects.get(user=user)
                if appointment.psychologist != psychologist:
                    return Response(
                        {"detail": "No tiene permiso para modificar esta cita."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except PsychologistProfile.DoesNotExist:
                return Response(
                    {"detail": "No se encontró el perfil de psicólogo."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Obtener las notas
            notes = request.data.get('psychologist_notes')
            
            if not notes:
                return Response(
                    {"detail": "Se requieren notas para actualizar."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Actualizar las notas
            appointment.psychologist_notes = notes
            appointment.save()
            
            return Response({
                "detail": "Notas actualizadas correctamente."
            })
            
        except Appointment.DoesNotExist:
            return Response(
                {"detail": "No se encontró la cita."},
                status=status.HTTP_404_NOT_FOUND
            )


    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsClient])
    def client_appointments(self, request):
        """Endpoint para obtener las citas del cliente clasificadas como próximas, pasadas y todas"""
        user = request.user
        try:
            client = ClientProfile.objects.get(user=user)
        except ClientProfile.DoesNotExist:
            return Response(
                {"detail": "No se encontró el perfil de cliente para este usuario."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Obtener todas las citas del cliente
        appointments = Appointment.objects.filter(client=client)
        
        # Fecha actual para comparar
        today = timezone.now().date()
        current_time = timezone.now().time()
        
        # Clasificar las citas
        upcoming_appointments = appointments.filter(
            Q(date__gt=today) | 
            (Q(date=today) & Q(start_time__gt=current_time))
        ).exclude(
            status__in=['COMPLETED', 'CANCELLED', 'NO_SHOW']
        ).order_by('date', 'start_time')
        
        past_appointments = appointments.filter(
            Q(date__lt=today) | 
            (Q(date=today) & Q(end_time__lt=current_time)) |
            Q(status__in=['COMPLETED', 'CANCELLED', 'NO_SHOW'])
        ).order_by('-date', '-start_time')
        
        # Serializar los resultados
        upcoming_serializer = self.get_serializer(upcoming_appointments, many=True)
        past_serializer = self.get_serializer(past_appointments, many=True)
        all_serializer = self.get_serializer(appointments.order_by('-date', 'start_time'), many=True)
        
        return Response({
            "upcoming": upcoming_serializer.data,
            "past": past_serializer.data,
            "all": all_serializer.data
        })

    @action(detail=False, methods=['get'], url_path='has-confirmed-appointments/(?P<pk>[^/.]+)')
    def has_confirmed_appointments(self, request, pk=None):
        """Endpoint para verificar si un cliente tiene citas confirmadas con un psicólogo específico"""
        user = self.request.user
        if user.user_type != 'client':
            return Response(
                {"detail": "Este endpoint es solo para clientes."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            client = ClientProfile.objects.get(user=user)
            psychologist_id = pk  # Usar el parámetro pk como psychologist_id
            
            # Verificar si hay citas completadas entre este cliente y el psicólogo
            confirmed_appointments = Appointment.objects.filter(
                client=client,
                psychologist_id=psychologist_id,
                status='CONFIRMED'
            ).exists()
            
            return Response({
                "has_confirmed_appointments": confirmed_appointments
            })
        except ClientProfile.DoesNotExist:
            return Response(
                {"detail": "No se encontró el perfil de cliente."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        """Endpoint para cancelar una cita"""
        try:
            appointment = self.get_object()
            user = request.user
            
            # Verificar que el usuario tiene permiso para cancelar esta cita
            if user.user_type == 'client':
                try:
                    client = ClientProfile.objects.get(user=user)
                    if appointment.client != client:
                        return Response(
                            {"detail": "No tiene permiso para cancelar esta cita."},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except ClientProfile.DoesNotExist:
                    return Response(
                        {"detail": "No se encontró el perfil de cliente."},
                        status=status.HTTP_404_NOT_FOUND
                    )
            elif user.user_type == 'psychologist':
                try:
                    psychologist = PsychologistProfile.objects.get(user=user)
                    if appointment.psychologist != psychologist:
                        return Response(
                            {"detail": "No tiene permiso para cancelar esta cita."},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except PsychologistProfile.DoesNotExist:
                    return Response(
                        {"detail": "No se encontró el perfil de psicólogo."},
                        status=status.HTTP_404_NOT_FOUND
                    )
            elif user.user_type != 'admin':
                return Response(
                    {"detail": "No tiene permiso para cancelar esta cita."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verificar que la cita está en un estado que permite cancelación
            allowed_states = ['PENDING_PAYMENT', 'PAYMENT_UPLOADED', 'PAYMENT_VERIFIED', 'CONFIRMED']
            if appointment.status not in allowed_states:
                return Response(
                    {"detail": f"No se puede cancelar la cita. Estado actual: {appointment.get_status_display()}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Obtener motivo de cancelación
            cancellation_reason = request.data.get('cancellation_reason', '')
            
            # Actualizar estado de la cita
            appointment.status = 'CANCELLED'
            appointment.cancellation_reason = cancellation_reason
            appointment.cancelled_by = user
            appointment.cancelled_at = timezone.now()
            appointment.save()
            
            return Response({
                "detail": "Cita cancelada correctamente.",
                "appointment": AppointmentSerializer(appointment).data
            })
            
        except Appointment.DoesNotExist:
            return Response(
                {"detail": "No se encontró la cita."},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsAdminUser], url_path='admin-payment-verification')
    def admin_payment_verification(self, request):
        """Endpoint para que los administradores vean todas las citas con pagos pendientes de verificación y confirmación"""
        # Filtrar citas con los mismos estados que ven los psicólogos
        appointments = Appointment.objects.filter(
            status__in=['PAYMENT_UPLOADED', 'PAYMENT_VERIFIED', 'CONFIRMED']
        ).order_by('-created_at')
        
        # Opción de filtrado por psicólogo
        psychologist_id = request.query_params.get('psychologist_id')
        if psychologist_id:
            appointments = appointments.filter(psychologist_id=psychologist_id)
        
        # Opción de filtrado por estado específico
        status_filter = request.query_params.get('status')
        if status_filter:
            if ',' in status_filter:
                # Si hay múltiples estados separados por coma
                status_list = status_filter.split(',')
                appointments = appointments.filter(status__in=status_list)
            else:
                # Si es un solo estado
                appointments = appointments.filter(status=status_filter)
        
        # Opción de filtrado por fecha
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                appointments = appointments.filter(date__gte=start_date)
            except ValueError:
                return Response(
                    {"detail": "Formato de fecha de inicio inválido. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                appointments = appointments.filter(date__lte=end_date)
            except ValueError:
                return Response(
                    {"detail": "Formato de fecha de fin inválido. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsPsychologist])
    def psychologist_pending_payments(self, request):
        """Endpoint para que los psicólogos vean sus citas con pagos pendientes de verificación"""
        user = request.user
        try:
            psychologist = PsychologistProfile.objects.get(user=user)
            
            # Filtrar citas del psicólogo con pagos subidos pero no verificados
            appointments = Appointment.objects.filter(
                psychologist=psychologist,
                status__in=['PAYMENT_UPLOADED', 'PAYMENT_VERIFIED', 'CONFIRMED']
            ).order_by('-created_at')
            
            # Opción de filtrado por estado
            status_filter = request.query_params.get('status')
            if status_filter:
                appointments = appointments.filter(status=status_filter)
            
            # Opción de filtrado por fecha
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            
            if start_date:
                try:
                    start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                    appointments = appointments.filter(date__gte=start_date)
                except ValueError:
                    return Response(
                        {"detail": "Formato de fecha de inicio inválido. Use YYYY-MM-DD."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            if end_date:
                try:
                    end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                    appointments = appointments.filter(date__lte=end_date)
                except ValueError:
                    return Response(
                        {"detail": "Formato de fecha de fin inválido. Use YYYY-MM-DD."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Paginar resultados
            page = self.paginate_queryset(appointments)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(appointments, many=True)
            return Response(serializer.data)
            
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": "No se encontró el perfil de psicólogo para este usuario."},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_payment_status(self, request, pk=None):
        """Endpoint para que los administradores y psicólogos actualicen el estado de una cita después de verificar el pago"""
        user = request.user
        appointment = self.get_object()
        
        # Verificar permisos según el rol
        if user.user_type == 'admin':
            # Los administradores pueden actualizar cualquier cita
            pass
        elif user.user_type == 'psychologist':
            # Los psicólogos solo pueden actualizar sus propias citas
            try:
                psychologist = PsychologistProfile.objects.get(user=user)
                if appointment.psychologist != psychologist:
                    return Response(
                        {"detail": "No tiene permiso para modificar esta cita."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except PsychologistProfile.DoesNotExist:
                return Response(
                    {"detail": "No se encontró el perfil de psicólogo."},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            return Response(
                {"detail": "No tiene permiso para modificar esta cita."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar que la cita está en un estado adecuado
        if appointment.status not in ['PAYMENT_UPLOADED', 'PAYMENT_VERIFIED']:
            return Response(
                {"detail": f"No se puede actualizar el estado de pago. Estado actual: {appointment.get_status_display()}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener el nuevo estado
        new_status = request.data.get('status')
        
        # Validar que el estado es válido
        valid_statuses = ['PAYMENT_VERIFIED', 'CONFIRMED']
        if not new_status or new_status not in valid_statuses:
            return Response(
                {"detail": f"Estado no válido. Opciones permitidas: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar el estado
        appointment.status = new_status
        
        # Si es un administrador verificando el pago, actualizar el campo correspondiente
        if user.user_type == 'admin' and new_status == 'PAYMENT_VERIFIED':
            appointment.payment_verified_by = user
        
        # Guardar notas si se proporcionan
        notes = request.data.get('notes')
        if notes:
            if user.user_type == 'admin':
                appointment.admin_notes = notes
            elif user.user_type == 'psychologist':
                appointment.psychologist_notes = notes
        
        appointment.save()
        
        return Response({
            "detail": f"Estado actualizado a '{appointment.get_status_display()}'.",
            "appointment": AppointmentSerializer(appointment).data
        })

    @action(detail=True, methods=['get'], url_path='download-payment-proof')
    def download_payment_proof(self, request, pk=None):
        """Endpoint para descargar el comprobante de pago"""
        try:
            # Verificar si se recibió un token explícito en la URL (para visualizaciones en nueva pestaña)
            token_param = request.query_params.get('token')
            view_mode = request.query_params.get('view', 'false').lower() == 'true'
            
            # Si hay un token en los parámetros, usarlo para la autenticación
            if token_param:
                from rest_framework_simplejwt.tokens import AccessToken
                from rest_framework_simplejwt.exceptions import TokenError
                try:
                    # Validar el token y obtener el usuario
                    token = AccessToken(token_param)
                    user_id = token.payload.get('user_id')
                    
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    
                    user = User.objects.get(id=user_id)
                    request.user = user
                except (TokenError, User.DoesNotExist) as e:
                    return Response(
                        {"detail": "Token inválido o expirado."},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
            appointment = self.get_object()
            
            # Verificar permisos según el rol
            user = request.user
            
            if user.user_type == 'admin':
                # Los administradores pueden descargar cualquier comprobante
                pass
            elif user.user_type == 'psychologist':
                # Los psicólogos solo pueden descargar comprobantes de sus propias citas
                try:
                    psychologist = PsychologistProfile.objects.get(user=user)
                    if appointment.psychologist != psychologist:
                        return Response(
                            {"detail": "No tiene permiso para acceder a este comprobante."},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except PsychologistProfile.DoesNotExist:
                    return Response(
                        {"detail": "No se encontró el perfil de psicólogo."},
                        status=status.HTTP_404_NOT_FOUND
                    )
            elif user.user_type == 'client':
                # Los clientes solo pueden descargar comprobantes de sus propias citas
                try:
                    client = ClientProfile.objects.get(user=user)
                    if appointment.client != client:
                        return Response(
                            {"detail": "No tiene permiso para acceder a este comprobante."},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except ClientProfile.DoesNotExist:
                    return Response(
                        {"detail": "No se encontró el perfil de cliente."},
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:
                return Response(
                    {"detail": "No tiene permiso para acceder a este comprobante."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verificar que exista el comprobante
            if not appointment.payment_proof:
                return Response(
                    {"detail": "Esta cita no tiene comprobante de pago."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Obtener la ruta del archivo
            file_path = appointment.payment_proof.path
            
            if not os.path.exists(file_path):
                return Response(
                    {"detail": "El archivo no existe en el servidor."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Determinar el tipo de contenido basado en la extensión del archivo
            import mimetypes
            content_type, encoding = mimetypes.guess_type(file_path)
            if not content_type:
                content_type = 'application/octet-stream'
            
            # Obtener el nombre original del archivo
            filename = os.path.basename(file_path)
            
            # Abrir y leer el archivo
            with open(file_path, 'rb') as file:
                response = HttpResponse(file.read(), content_type=content_type)
            
            # Establecer el encabezado Content-Disposition según el modo
            if view_mode:
                # Para visualización en el navegador
                response['Content-Disposition'] = f'inline; filename="{filename}"'
            else:
                # Para descarga
                response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            return response
            
        except Appointment.DoesNotExist:
            return Response(
                {"detail": "No se encontró la cita."},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'], url_path='is-first-appointment', permission_classes=[permissions.IsAuthenticated])
    def is_first_appointment(self, request, pk=None):
        """
        Determina si la cita especificada es la primera entre el psicólogo y el cliente.
        """
        appointment = self.get_object()
        
        # Buscar citas anteriores entre este cliente y psicólogo, ordenadas por fecha
        previous_appointments = Appointment.objects.filter(
            client=appointment.client,
            psychologist=appointment.psychologist,
            date__lt=appointment.date
        ).order_by('date', 'start_time')
        
        # También verificar citas el mismo día pero con hora anterior
        same_day_earlier = Appointment.objects.filter(
            client=appointment.client,
            psychologist=appointment.psychologist,
            date=appointment.date,
            start_time__lt=appointment.start_time
        )
        
        # Si no hay citas anteriores, entonces esta es la primera
        is_first = not (previous_appointments.exists() or same_day_earlier.exists())
        
        return Response({
            'is_first_appointment': is_first,
            'appointment_id': appointment.id,
            'client_id': appointment.client.id,
            'psychologist_id': appointment.psychologist.id
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsPsychologist])
    def psychologist_patients(self, request):
        """
        Obtiene la lista de pacientes que ha atendido el psicólogo autenticado,
        junto con información de citas pasadas y futuras.
        """
        try:
            user = request.user
            
            try:
                psychologist = PsychologistProfile.objects.get(user=user)
            except PsychologistProfile.DoesNotExist:
                return Response(
                    {"detail": "No se encontró el perfil de psicólogo para este usuario."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Obtener todas las citas confirmadas o completadas del psicólogo
            appointments = Appointment.objects.filter(
                psychologist=psychologist,
                status__in=['PAYMENT_VERIFIED', 'CONFIRMED', 'COMPLETED']
            ).select_related('client', 'client__user')
            
            # Agrupar por cliente
            clients_dict = {}
            
            for appointment in appointments:
                client_id = appointment.client.id
                
                if client_id not in clients_dict:
                    # Si es la primera vez que vemos este cliente, inicializar sus datos
                    clients_dict[client_id] = {
                        'id': client_id,
                        'user': {
                            'id': appointment.client.user.id,
                            'first_name': appointment.client.user.first_name,
                            'last_name': appointment.client.user.last_name,
                            'email': appointment.client.user.email,
                            'is_active': appointment.client.user.is_active
                        },
                        'profile_image': appointment.client.profile_image.url if appointment.client.profile_image else None,
                        'rut': appointment.client.rut,
                        'region': appointment.client.region,
                        'appointments': [],
                        'total_appointments': 0
                    }
                
                # Añadir esta cita a la lista de citas del cliente
                clients_dict[client_id]['appointments'].append({
                    'id': appointment.id,
                    'date': appointment.date,
                    'start_time': appointment.start_time,
                    'status': appointment.status
                })
                clients_dict[client_id]['total_appointments'] += 1
            
            # Procesar cada cliente para obtener primera y última cita
            result = []
            for client_data in clients_dict.values():
                appointments = client_data.pop('appointments')
                
                # Ordenar citas por fecha
                appointments.sort(key=lambda a: (a['date'], a['start_time']))
                
                # Citas completadas (pasadas)
                past_appointments = [a for a in appointments if a['status'] == 'COMPLETED']
                
                # Citas confirmadas (futuras)
                future_appointments = [a for a in appointments if a['status'] in ['PAYMENT_VERIFIED', 'CONFIRMED']]
                future_appointments.sort(key=lambda a: (a['date'], a['start_time']))
                
                # Última cita (la más reciente entre las completadas)
                if past_appointments:
                    client_data['last_appointment_date'] = past_appointments[-1]['date']
                
                # Próxima cita (la más cercana entre las confirmadas)
                if future_appointments:
                    client_data['next_appointment_date'] = future_appointments[0]['date']
                
                result.append(client_data)
            
            return Response(result)
                
        except Exception as e:
            import traceback
            print(f"Error al obtener pacientes: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {"detail": f"Error al obtener pacientes: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

   