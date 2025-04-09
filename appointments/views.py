from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentCreateSerializer
from .services import get_available_slots
from profiles.models import PsychologistProfile
from authentication.models import User
from profiles.permissions import IsClient, IsPsychologist, IsAdminUser

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'client':
            return Appointment.objects.filter(client=user)
        elif user.user_type == 'psychologist':
            try:
                profile = PsychologistProfile.objects.get(user=user)
                return Appointment.objects.filter(psychologist=profile)
            except PsychologistProfile.DoesNotExist:
                return Appointment.objects.none()
        elif user.user_type == 'admin':
            return Appointment.objects.all()
        return Appointment.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'create_appointment':
            return AppointmentCreateSerializer
        return AppointmentSerializer

    @action(detail=False, methods=['GET'], permission_classes=[AllowAny])
    def available_slots(self, request):
        """Get available time slots for a specific psychologist on a given date"""
        profile_id = request.query_params.get('profile_id')
        date_str = request.query_params.get('date')
        
        if not profile_id or not date_str:
            return Response(
                {"detail": "Se requieren los parámetros profile_id y date"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Intenta convertir el ID a entero
            profile_id = int(profile_id)
            
            # Intenta obtener el perfil directamente por ID
            try:
                psychologist = PsychologistProfile.objects.get(id=profile_id)
                print(f"Found psychologist profile with ID {profile_id}: {psychologist}")
            except PsychologistProfile.DoesNotExist:
                # Si no existe, intenta obtenerlo por el ID de usuario
                try:
                    user = User.objects.get(id=profile_id)
                    if user.user_type != 'psychologist':
                        return Response(
                            {"detail": "El usuario no es un psicólogo"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    psychologist = PsychologistProfile.objects.get(user=user)
                    print(f"Found psychologist profile through user ID {profile_id}: {psychologist}")
                except (User.DoesNotExist, PsychologistProfile.DoesNotExist):
                    return Response(
                        {"detail": "Psicólogo no encontrado"},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Convertir la fecha de string a objeto date
            try:
                date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {"detail": "Formato de fecha inválido. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Obtener los slots disponibles
            available_slots = get_available_slots(psychologist.id, date_obj)
            
            return Response(available_slots)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['GET'])
    def monthly_availability(self, request):
        """Get availability for a month for a specific psychologist"""
        profile_id = request.query_params.get('profile_id')
        year_month = request.query_params.get('year_month')  # Format: YYYY-MM
        
        if not profile_id or not year_month:
            return Response(
                {"detail": "Se requieren los parámetros profile_id y year_month"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Intenta convertir el ID a entero
            profile_id = int(profile_id)
            
            # Intenta obtener el perfil directamente por ID
            try:
                psychologist = PsychologistProfile.objects.get(id=profile_id)
            except PsychologistProfile.DoesNotExist:
                # Si no existe, intenta obtenerlo por el ID de usuario
                try:
                    user = User.objects.get(id=profile_id)
                    if user.user_type != 'psychologist':
                        return Response(
                            {"detail": "El usuario no es un psicólogo"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    psychologist = PsychologistProfile.objects.get(user=user)
                except (User.DoesNotExist, PsychologistProfile.DoesNotExist):
                    return Response(
                        {"detail": "Psicólogo no encontrado"},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Parse year and month
            try:
                year, month = map(int, year_month.split('-'))
                # Get the number of days in the month
                if month == 12:
                    next_month = datetime(year + 1, 1, 1)
                else:
                    next_month = datetime(year, month + 1, 1)
                last_day = (next_month - timedelta(days=1)).day
                
                # Get availability for each day in the month
                availability = []
                for day in range(1, last_day + 1):
                    date_obj = datetime(year, month, day).date()
                    # Skip past dates
                    if date_obj < timezone.now().date():
                        continue
                    
                    slots = get_available_slots(psychologist.id, date_obj)
                    availability.append({
                        'date': date_obj.strftime('%Y-%m-%d'),
                        'slots': slots,
                        'hasAvailableSlots': len(slots) > 0
                    })
                
                return Response(availability)
                
            except ValueError:
                return Response(
                    {"detail": "Formato de year_month inválido. Use YYYY-MM"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['POST'], permission_classes=[IsClient])
    def create_appointment(self, request):
        """Create a new appointment"""
        serializer = AppointmentCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(client=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['PATCH'], permission_classes=[IsClient])
    def cancel_appointment(self, request, pk=None):
        """Cancel an appointment"""
        appointment = self.get_object()
        
        # Solo el cliente que creó la cita puede cancelarla
        if appointment.client != request.user:
            return Response(
                {"detail": "No tienes permiso para cancelar esta cita"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Solo se pueden cancelar citas pendientes o confirmadas
        if appointment.status not in ['PENDING', 'CONFIRMED', 'PAYMENT_PENDING']:
            return Response(
                {"detail": "No se puede cancelar una cita que ya ha sido cancelada o completada"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'CANCELLED'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['PATCH'], permission_classes=[IsPsychologist])
    def confirm_appointment(self, request, pk=None):
        """Confirm an appointment"""
        appointment = self.get_object()
        
        # Verificar que el psicólogo es el dueño de la cita
        try:
            psychologist_profile = PsychologistProfile.objects.get(user=request.user)
            if appointment.psychologist != psychologist_profile:
                return Response(
                    {"detail": "No tienes permiso para confirmar esta cita"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": "No se encontró el perfil de psicólogo"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Solo se pueden confirmar citas pendientes
        if appointment.status != 'PENDING':
            return Response(
                {"detail": "Solo se pueden confirmar citas pendientes"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'CONFIRMED'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['PATCH'], permission_classes=[IsPsychologist])
    def complete_appointment(self, request, pk=None):
        """Mark an appointment as completed"""
        appointment = self.get_object()
        
        # Verificar que el psicólogo es el dueño de la cita
        try:
            psychologist_profile = PsychologistProfile.objects.get(user=request.user)
            if appointment.psychologist != psychologist_profile:
                return Response(
                    {"detail": "No tienes permiso para completar esta cita"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": "No se encontró el perfil de psicólogo"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Solo se pueden completar citas confirmadas
        if appointment.status != 'CONFIRMED':
            return Response(
                {"detail": "Solo se pueden completar citas confirmadas"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = 'COMPLETED'
        appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['PATCH'], permission_classes=[IsClient])
    def update_notes(self, request, pk=None):
        """Update client notes for an appointment"""
        appointment = self.get_object()
        
        # Solo el cliente que creó la cita puede actualizar las notas
        if appointment.client != request.user:
            return Response(
                {"detail": "No tienes permiso para actualizar las notas de esta cita"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        notes = request.data.get('notes')
        if notes is not None:
            appointment.notes = notes
            appointment.save()
        
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
    
    @action(detail=False, methods=['GET'], permission_classes=[IsClient])
    def my_appointments(self, request):
        """Get all appointments for the authenticated client"""
        appointments = Appointment.objects.filter(client=request.user)
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['GET'], permission_classes=[IsPsychologist])
    def psychologist_appointments(self, request):
        """Get all appointments for the authenticated psychologist"""
        try:
            psychologist_profile = PsychologistProfile.objects.get(user=request.user)
            appointments = Appointment.objects.filter(psychologist=psychologist_profile)
            serializer = self.get_serializer(appointments, many=True)
            return Response(serializer.data)
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": "No se encontró el perfil de psicólogo"},
                status=status.HTTP_404_NOT_FOUND
            )


# Añadir esta función en la clase AppointmentViewSet

def get_psychologist_profile(self, psychologist_id):
    """
    Obtiene el perfil del psicólogo a partir del ID proporcionado.
    Puede ser un ID de perfil o un ID de usuario.
    """
    try:
        # Primero intentamos obtener directamente el perfil por ID
        return PsychologistProfile.objects.get(id=psychologist_id)
    except PsychologistProfile.DoesNotExist:
        # Si no existe, intentamos obtenerlo por el ID de usuario
        try:
            user = User.objects.get(id=psychologist_id)
            if user.user_type != 'psychologist':
                raise ValueError("El usuario no es un psicólogo")
            return PsychologistProfile.objects.get(user=user)
        except (User.DoesNotExist, PsychologistProfile.DoesNotExist):
            raise ValueError(f"No se encontró el perfil de psicólogo para el ID {psychologist_id}")