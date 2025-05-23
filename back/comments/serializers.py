from rest_framework import serializers
from .models import Comment
from appointments.models import Appointment
from profiles.models import PsychologistProfile, ClientProfile
from django.utils import timezone
from datetime import timedelta

class CommentSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)
    rating = serializers.IntegerField(min_value=1, max_value=5)
    
    class Meta:
        model = Comment
        fields = ['id', 'psychologist', 'patient', 'appointment', 'comment', 'rating', 'created_at', 'status']
        read_only_fields = ['created_at', 'status', 'patient']
    
    def validate(self, data):
        # Verificar que la cita existe y está completada
        appointment = data.get('appointment')
        if not appointment:
            raise serializers.ValidationError(
                {"appointment": "La cita es requerida."}
            )
            
        if appointment.status != 'COMPLETED':
            raise serializers.ValidationError(
                {"appointment": "Solo se puede valorar una cita que haya sido completada."}
            )
            
        # Verificar que la valoración se realice dentro de los 3 días posteriores a la cita
        completed_date = appointment.date
        now = timezone.now().date()
        if (now - completed_date) > timedelta(days=3):
            raise serializers.ValidationError(
                {"appointment": "Solo puedes valorar dentro de los 3 días posteriores a la cita completada."}
            )
            
        # Verificar que no existe una valoración para esta cita
        if self.instance is None:  # Solo para creación, no para actualización
            if Comment.objects.filter(appointment=appointment).exists():
                raise serializers.ValidationError(
                    {"appointment": "Ya existe una valoración para esta cita."}
                )
                
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