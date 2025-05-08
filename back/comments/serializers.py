from rest_framework import serializers
from .models import Comment
from appointments.models import Appointment
from profiles.models import PsychologistProfile, ClientProfile

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'psychologist', 'patient', 'appointment', 'text', 'rating', 'created_at', 'approved']
        read_only_fields = ['created_at', 'approved']
    
    def validate(self, data):
        # Verificar que la cita existe y está completada
        appointment = data.get('appointment')
        if appointment.status != 'COMPLETED':
            raise serializers.ValidationError(
                {"appointment": "Solo se puede comentar una cita que haya sido completada."}
            )
        
        # Verificar que el cliente de la cita coincide con el cliente que está comentando
        if appointment.client != data.get('patient'):
            raise serializers.ValidationError(
                {"patient": "Solo el paciente que asistió a la cita puede dejar un comentario."}
            )
        
        # Verificar que el psicólogo de la cita coincide con el psicólogo que se está comentando
        if appointment.psychologist != data.get('psychologist'):
            raise serializers.ValidationError(
                {"psychologist": "El psicólogo comentado debe ser el mismo que atendió la cita."}
            )
        
        # Verificar que no existe un comentario para esta cita
        if self.instance is None:  # Solo para creación, no para actualización
            if Comment.objects.filter(appointment=appointment).exists():
                raise serializers.ValidationError(
                    {"appointment": "Ya existe un comentario para esta cita."}
                )
        
        return data


class CommentReadSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    psychologist_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'psychologist', 'patient', 'psychologist_name', 'patient_name', 
                 'text', 'rating', 'created_at', 'approved']
    
    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name() or obj.patient.user.email
    
    def get_psychologist_name(self, obj):
        return obj.psychologist.user.get_full_name() or obj.psychologist.user.email 