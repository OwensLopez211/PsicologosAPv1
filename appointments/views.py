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
