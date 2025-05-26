from rest_framework import serializers
from .models import Comment
from appointments.models import Appointment
from profiles.models import PsychologistProfile, ClientProfile
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class CommentSerializer(serializers.ModelSerializer):
    status = serializers.CharField()
    rating = serializers.IntegerField(min_value=1, max_value=5)
    appointment = serializers.PrimaryKeyRelatedField(
        queryset=Appointment.objects.all(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Comment
        fields = ['id', 'psychologist', 'patient', 'appointment', 'comment', 'rating', 'created_at', 'status']
        read_only_fields = ['id', 'psychologist', 'patient', 'created_at', 'status']
    
    def validate(self, data):
        logger.info(f"Validating data for CommentSerializer: {data}")

        if self.instance is None:
            logger.info("Validation for creation.")
            appointment = data.get('appointment')

            if not appointment:
                logger.error("Validation failed (creation): Appointment is required.")
                raise serializers.ValidationError({"appointment": "La cita es requerida para crear una valoración."})

            logger.info(f"Validating appointment: {appointment.id} with status {appointment.status}")
            
            request = self.context.get('request')
            if request and request.user.is_authenticated:
                try:
                    client_profile = ClientProfile.objects.get(user=request.user)
                    if appointment.client != client_profile:
                        logger.error("Validation failed (creation): Appointment does not belong to the authenticated client.")
                        raise serializers.ValidationError(
                            {"appointment": "No tienes permiso para valorar esta cita."}
                        )
                except ClientProfile.DoesNotExist:
                    logger.error("Validation failed (creation): Client profile not found for authenticated user.")
                    raise serializers.ValidationError(
                        {"non_field_errors": "No se encontró tu perfil de cliente."}
                    )
            else:
                logger.error("Validation failed (creation): User not authenticated or request context missing.")
                raise serializers.ValidationError(
                    {"non_field_errors": "Usuario no autenticado."}
                )
            
            if appointment.status != 'COMPLETED':
                logger.error(f"Validation failed (creation): Appointment status is not COMPLETED ({appointment.status}).")
                raise serializers.ValidationError(
                    {"appointment": "Solo se puede valorar una cita que haya sido completada."}
                )
            
            completed_date = appointment.date
            now = timezone.now().date()
            if (now - completed_date) > timedelta(days=3):
                logger.error(f"Validation failed (creation): Comment period expired. Completed date: {completed_date}, today: {now}")
                raise serializers.ValidationError(
                    {"appointment": f"Solo puedes valorar dentro de los 3 días posteriores a la cita completada (hasta {completed_date + timedelta(days=3)})."}
                )
            
            if Comment.objects.filter(appointment=appointment).exists():
                logger.error(f"Validation failed (creation): Comment already exists for appointment {appointment.id}.")
                raise serializers.ValidationError(
                    {"appointment": "Ya existe una valoración para esta cita."}
                )

        else:
            logger.info("Validation for update.")
            if 'status' in data and data['status'] not in ['APPROVED', 'REJECTED']:
                logger.error(f"Validation failed (update): Invalid status {data['status']}.")
                raise serializers.ValidationError({"status": "Estado no válido."})

        return data

class CommentReadSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    psychologist_name = serializers.SerializerMethodField()
    appointment_date = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'psychologist', 'patient', 'psychologist_name', 'patient_name',
            'comment', 'rating', 'created_at', 'status', 'appointment_date'
        ]
    
    def get_patient_name(self, obj):
        if obj.patient and obj.patient.user:
            return f"{obj.patient.user.first_name} {obj.patient.user.last_name}".strip() or obj.patient.user.email
        return None
    
    def get_psychologist_name(self, obj):
        if obj.psychologist and obj.psychologist.user:
            return f"{obj.psychologist.user.first_name} {obj.psychologist.user.last_name}".strip() or obj.psychologist.user.email
        return None
        
    def get_appointment_date(self, obj):
        if obj.appointment:
            return obj.appointment.date
        return None