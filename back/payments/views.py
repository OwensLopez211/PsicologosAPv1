from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PaymentDetail
from .serializers import PaymentDetailSerializer
from appointments.models import Appointment
from authentication.permissions import IsClient, IsPsychologist, IsAdminUser
from profiles.models import PsychologistProfile  # Añadir esta importación
from django.http import FileResponse
import os

class PaymentDetailViewSet(viewsets.ModelViewSet):
    queryset = PaymentDetail.objects.all()
    serializer_class = PaymentDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def create_with_appointment(self, request):
        """Create a payment detail with appointment information"""
        appointment_id = request.data.get('appointment_id')
        payment_method = request.data.get('payment_method')
        
        if not appointment_id or not payment_method:
            return Response(
                {"detail": "Se requiere appointment_id y payment_method"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            
            # Check if the appointment belongs to the current user
            if request.user.user_type == 'client' and appointment.client.user != request.user:
                return Response(
                    {"detail": "No tiene permiso para crear un pago para esta cita"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Create payment detail
            payment_detail = PaymentDetail.objects.create(
                appointment=appointment,
                payment_method=payment_method
            )
            
            return Response(
                PaymentDetailSerializer(payment_detail).data,
                status=status.HTTP_201_CREATED
            )
            
        except Appointment.DoesNotExist:
            return Response(
                {"detail": "Cita no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )
            
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def pending_payments(self, request):
        """Endpoint para obtener pagos pendientes de verificación"""
        user = request.user
        
        # Filtrar según el tipo de usuario
        if user.user_type == 'admin':
            # Los administradores pueden ver todos los pagos pendientes
            appointments = Appointment.objects.filter(status='PAYMENT_UPLOADED')
        elif user.user_type == 'psychologist':
            # Los psicólogos solo pueden ver los pagos pendientes de sus citas
            try:
                # Usar el ID del usuario para buscar el perfil directamente
                psychologist_profile = PsychologistProfile.objects.get(user=user)
                appointments = Appointment.objects.filter(
                    psychologist=psychologist_profile,
                    status='PAYMENT_UPLOADED'
                )
            except PsychologistProfile.DoesNotExist:
                return Response(
                    {"detail": "No se encontró el perfil de psicólogo para este usuario."},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            return Response(
                {"detail": "No tiene permisos para ver pagos pendientes."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener detalles de pago para las citas
        payment_details = []
        for appointment in appointments:
            # Crear un diccionario base con la información de la cita
            payment_data = {
                'appointment_id': appointment.id,
                'client_name': appointment.client.user.get_full_name(),
                'psychologist_name': appointment.psychologist.user.get_full_name(),
                'appointment_date': appointment.date,
                'appointment_time': appointment.start_time,
                'payment_amount': float(appointment.payment_amount),
                'has_proof': bool(appointment.payment_proof),
                'status': appointment.status,
                'status_display': appointment.get_status_display(),
                'payment_proof': request.build_absolute_uri(appointment.payment_proof.url) if appointment.payment_proof else None
            }
            
            # Intentar obtener detalles de pago si existen
            try:
                payment_detail = PaymentDetail.objects.get(appointment=appointment)
                payment_detail_data = PaymentDetailSerializer(payment_detail).data
                # Actualizar el diccionario con los datos del detalle de pago
                payment_data['payment_detail'] = payment_detail_data
                payment_data['id'] = payment_detail.id  # ID del detalle de pago
            except PaymentDetail.DoesNotExist:
                # Si no hay detalle de pago, simplemente continuamos con los datos básicos
                payment_data['payment_detail'] = None
                payment_data['id'] = None
            
            payment_details.append(payment_data)
        
        return Response(payment_details)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminUser])
    def admin_verify_payment(self, request, pk=None):
        """Endpoint para que el administrador verifique el pago de una cita"""
        try:
            payment_detail = self.get_object()
            appointment = payment_detail.appointment
            
            # Verificar que el usuario es administrador
            user = request.user
            if user.user_type != 'admin':
                return Response(
                    {"detail": "No tiene permiso para verificar este pago."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verificar que la cita está en el estado correcto
            if appointment.status != 'PAYMENT_UPLOADED':
                return Response(
                    {"detail": f"No se puede verificar el pago. Estado actual: {appointment.get_status_display()}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Actualizar estado de la cita
            appointment.status = 'CONFIRMED'
            appointment.payment_verified_by = user
            
            # Añadir notas del administrador si se proporcionan
            admin_notes = request.data.get('admin_notes')
            if admin_notes:
                appointment.admin_notes = admin_notes
            
            appointment.save()
            
            return Response({
                "detail": "Pago verificado correctamente. La cita ha sido confirmada."
            })
            
        except PaymentDetail.DoesNotExist:
            return Response(
                {"detail": "No se encontró el detalle de pago."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsPsychologist])
    def psychologist_verify_payment(self, request, pk=None):
        """Endpoint para que el psicólogo verifique el pago de una cita"""
        try:
            payment_detail = self.get_object()
            appointment = payment_detail.appointment
            
            # Verificar que la cita pertenece al psicólogo que hace la solicitud
            user = request.user
            if user.user_type != 'psychologist' or appointment.psychologist.user != user:
                return Response(
                    {"detail": "No tiene permiso para verificar este pago."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verificar que no sea la primera cita del cliente con este psicólogo
            # Contar cuántas citas ha tenido este cliente con este psicólogo
            from appointments.models import Appointment
            previous_appointments = Appointment.objects.filter(
                client=appointment.client,
                psychologist=appointment.psychologist,
                date__lt=appointment.date  # Citas anteriores a la actual
            ).count()
            
            if previous_appointments == 0:
                return Response(
                    {"detail": "No puede verificar el pago de la primera cita de un cliente. Este pago debe ser verificado por un administrador."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verificar que la cita está en el estado correcto
            if appointment.status != 'PAYMENT_UPLOADED':
                return Response(
                    {"detail": f"No se puede verificar el pago. Estado actual: {appointment.get_status_display()}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Actualizar estado de la cita
            appointment.status = 'CONFIRMED'
            appointment.payment_verified_by = user
            
            # Añadir notas del psicólogo si se proporcionan
            psychologist_notes = request.data.get('psychologist_notes')
            if psychologist_notes:
                appointment.psychologist_notes = psychologist_notes
            
            appointment.save()
            
            return Response({
                "detail": "Pago verificado correctamente. La cita ha sido confirmada."
            })
            
        except PaymentDetail.DoesNotExist:
            return Response(
                {"detail": "No se encontró el detalle de pago."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], url_path='view-payment-proof/(?P<appointment_id>[^/.]+)', permission_classes=[permissions.IsAuthenticated])
    def view_payment_proof(self, request, appointment_id=None):
        """Endpoint para ver el comprobante de pago de una cita"""
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            
            # Verificar permisos
            user = request.user
            if user.user_type == 'admin':
                # Los administradores pueden ver todos los comprobantes
                pass
            elif user.user_type == 'psychologist' and appointment.psychologist.user == user:
                # Los psicólogos solo pueden ver comprobantes de sus citas
                pass
            else:
                return Response(
                    {"detail": "No tiene permiso para ver este comprobante de pago."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verificar que existe un comprobante
            if not appointment.payment_proof:
                return Response(
                    {"detail": "Esta cita no tiene comprobante de pago subido."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Obtener información del comprobante
            payment_proof_info = {
                "appointment_id": appointment.id,
                "client_name": appointment.client.user.get_full_name(),
                "payment_amount": float(appointment.payment_amount),
                "payment_date": None,
                "payment_method": None,
                "transaction_id": None,
                # Asegurarse de que la URL del comprobante sea accesible
                "file_url": request.build_absolute_uri(appointment.payment_proof.url)
            }
            
            # Añadir detalles del pago si existen
            try:
                payment_detail = PaymentDetail.objects.get(appointment=appointment)
                payment_proof_info["payment_date"] = payment_detail.payment_date
                payment_proof_info["payment_method"] = payment_detail.payment_method
                payment_proof_info["transaction_id"] = payment_detail.transaction_id
            except PaymentDetail.DoesNotExist:
                pass
            
            return Response(payment_proof_info)
            
        except Appointment.DoesNotExist:
            return Response(
                {"detail": "No se encontró la cita."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def all_payments(self, request):
        """Endpoint para obtener todos los pagos (pendientes y verificados)"""
        user = request.user
        
        # Filtrar según el tipo de usuario
        if user.user_type == 'admin':
            # Los administradores pueden ver todos los pagos
            appointments = Appointment.objects.filter(
                status__in=['PAYMENT_UPLOADED', 'PAYMENT_VERIFIED', 'CONFIRMED']
            )
        elif user.user_type == 'psychologist':
            # Los psicólogos solo pueden ver los pagos de sus citas
            try:
                psychologist_profile = PsychologistProfile.objects.get(user=user)
                appointments = Appointment.objects.filter(
                    psychologist=psychologist_profile,
                    status__in=['PAYMENT_UPLOADED', 'PAYMENT_VERIFIED', 'CONFIRMED']
                )
            except PsychologistProfile.DoesNotExist:
                return Response(
                    {"detail": "No se encontró el perfil de psicólogo para este usuario."},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            return Response(
                {"detail": "No tiene permisos para ver pagos."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener detalles de pago para las citas
        payment_details = []
        for appointment in appointments:
            # Crear un diccionario base con la información de la cita
            payment_data = {
                'appointment_id': appointment.id,
                'client_name': appointment.client.user.get_full_name(),
                'psychologist_name': appointment.psychologist.user.get_full_name(),
                'appointment_date': appointment.date,
                'appointment_time': appointment.start_time,
                'payment_amount': float(appointment.payment_amount),
                'has_proof': bool(appointment.payment_proof),
                'status': appointment.status,
                'status_display': appointment.get_status_display(),
                'is_first_appointment': False  # Por defecto, no es primera cita
            }
            
            # Verificar si es la primera cita
            previous_appointments = Appointment.objects.filter(
                client=appointment.client,
                psychologist=appointment.psychologist,
                date__lt=appointment.date
            ).count()
            
            if previous_appointments == 0:
                payment_data['is_first_appointment'] = True
            
            # Intentar obtener detalles de pago si existen
            try:
                payment_detail = PaymentDetail.objects.get(appointment=appointment)
                payment_detail_data = PaymentDetailSerializer(payment_detail).data
                # Actualizar el diccionario con los datos del detalle de pago
                payment_data['payment_detail'] = payment_detail_data
                payment_data['id'] = payment_detail.id  # ID del detalle de pago
            except PaymentDetail.DoesNotExist:
                # Si no hay detalle de pago, simplemente continuamos con los datos básicos
                payment_data['payment_detail'] = None
                payment_data['id'] = None
            
            payment_details.append(payment_data)
        
        return Response(payment_details)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def filtered_payments(self, request):
        """Endpoint para obtener pagos filtrados por estado"""
        user = request.user
        
        # Obtener el parámetro de filtro de estado
        status_filter = request.query_params.get('status', None)
        
        # Validar estados permitidos
        valid_statuses = ['PAYMENT_UPLOADED', 'PAYMENT_VERIFIED', 'CONFIRMED', 'ALL']
        
        if status_filter and status_filter not in valid_statuses:
            return Response(
                {"detail": f"Estado de filtro no válido. Debe ser uno de: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Determinar los estados a filtrar
        if status_filter == 'ALL' or not status_filter:
            filter_statuses = ['PAYMENT_UPLOADED', 'PAYMENT_VERIFIED', 'CONFIRMED']
        else:
            filter_statuses = [status_filter]
        
        # Filtrar según el tipo de usuario
        if user.user_type == 'admin':
            # Los administradores pueden ver todos los pagos según el filtro
            appointments = Appointment.objects.filter(
                status__in=filter_statuses
            )
        elif user.user_type == 'psychologist':
            # Los psicólogos solo pueden ver los pagos de sus citas según el filtro
            try:
                psychologist_profile = PsychologistProfile.objects.get(user=user)
                appointments = Appointment.objects.filter(
                    psychologist=psychologist_profile,
                    status__in=filter_statuses
                )
            except PsychologistProfile.DoesNotExist:
                return Response(
                    {"detail": "No se encontró el perfil de psicólogo para este usuario."},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            return Response(
                {"detail": "No tiene permisos para ver pagos."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener detalles de pago para las citas
        payment_details = []
        for appointment in appointments:
            # Crear un diccionario base con la información de la cita
            payment_data = {
                'appointment_id': appointment.id,
                'client_name': appointment.client.user.get_full_name(),
                'psychologist_name': appointment.psychologist.user.get_full_name(),
                'appointment_date': appointment.date,
                'appointment_time': appointment.start_time,
                'payment_amount': float(appointment.payment_amount),
                'has_proof': bool(appointment.payment_proof),
                'status': appointment.status,
                'status_display': appointment.get_status_display(),
                'is_first_appointment': False  # Por defecto, no es primera cita
            }
            
            # Verificar si es la primera cita
            previous_appointments = Appointment.objects.filter(
                client=appointment.client,
                psychologist=appointment.psychologist,
                date__lt=appointment.date
            ).count()
            
            if previous_appointments == 0:
                payment_data['is_first_appointment'] = True
            
            # Intentar obtener detalles de pago si existen
            try:
                payment_detail = PaymentDetail.objects.get(appointment=appointment)
                payment_detail_data = PaymentDetailSerializer(payment_detail).data
                # Actualizar el diccionario con los datos del detalle de pago
                payment_data['payment_detail'] = payment_detail_data
                payment_data['id'] = payment_detail.id  # ID del detalle de pago
            except PaymentDetail.DoesNotExist:
                # Si no hay detalle de pago, simplemente continuamos con los datos básicos
                payment_data['payment_detail'] = None
                payment_data['id'] = None
            
            payment_details.append(payment_data)
        
        return Response(payment_details)
