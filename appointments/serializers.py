from rest_framework import serializers
from .models import Appointment
from profiles.serializers import PsychologistProfileSerializer
from authentication.serializers import UserSerializer
from profiles.models import PsychologistProfile
from django.utils import timezone
from datetime import datetime, time

class AppointmentSerializer(serializers.ModelSerializer):
    client_details = UserSerializer(source='client', read_only=True)
    psychologist_details = PsychologistProfileSerializer(source='psychologist', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'client', 'psychologist', 'date', 'start_time', 'end_time',
            'status', 'created_at', 'updated_at', 'notes', 'client_notes',
            'client_details', 'psychologist_details'
        ]
        read_only_fields = ['client', 'status', 'created_at', 'updated_at']

class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['psychologist', 'date', 'start_time', 'end_time', 'notes']
    
    def validate(self, data):
        """
        Validar que:
        1. El psicólogo existe
        2. La fecha no está en el pasado
        3. El slot está disponible
        """
        # Validar que el psicólogo existe
        try:
            psychologist = data.get('psychologist')
            if not psychologist:
                raise serializers.ValidationError("Se requiere el ID del psicólogo")
        except PsychologistProfile.DoesNotExist:
            raise serializers.ValidationError("Psicólogo no encontrado")
        
        # Validar que la fecha no está en el pasado
        date = data.get('date')
        if date < timezone.now().date():
            raise serializers.ValidationError("No se pueden agendar citas en fechas pasadas")
        
        # Validar que el slot está disponible
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        # Verificar si ya existe una cita para ese psicólogo en ese horario
        overlapping_appointments = Appointment.objects.filter(
            psychologist=psychologist,
            date=date,
            status__in=['PENDING', 'CONFIRMED']
        ).exclude(
            # Excluir citas que terminan antes o empiezan después
            start_time__gte=end_time
        ).exclude(
            end_time__lte=start_time
        )
        
        if overlapping_appointments.exists():
            raise serializers.ValidationError("El horario seleccionado ya no está disponible")
        
        return data
    
    # Modificar el método create en AppointmentCreateSerializer
    
    def create(self, validated_data):
        """
        Crea una nueva cita.
        """
        psychologist_id = validated_data.pop('psychologist')
        
        try:
            # Intentamos obtener el perfil del psicólogo
            if isinstance(psychologist_id, PsychologistProfile):
                psychologist = psychologist_id
            else:
                # Primero intentamos obtener directamente el perfil por ID
                try:
                    psychologist = PsychologistProfile.objects.get(id=psychologist_id)
                except PsychologistProfile.DoesNotExist:
                    # Si no existe, intentamos obtenerlo por el ID de usuario
                    try:
                        user = User.objects.get(id=psychologist_id)
                        if user.user_type != 'psychologist':
                            raise serializers.ValidationError({"psychologist": "El usuario no es un psicólogo"})
                        psychologist = PsychologistProfile.objects.get(user=user)
                    except (User.DoesNotExist, PsychologistProfile.DoesNotExist):
                        raise serializers.ValidationError({"psychologist": f"No se encontró el perfil de psicólogo para el ID {psychologist_id}"})
        
            # Creamos la cita con el perfil del psicólogo
            appointment = Appointment.objects.create(
                psychologist=psychologist,
                **validated_data
            )
            
            return appointment
        except Exception as e:
            raise serializers.ValidationError({"detail": str(e)})
        
        client = self.context['request'].user
        appointment = Appointment.objects.create(
            client=client,
            status='PENDING',
            **validated_data
        )
        return appointment