from rest_framework import serializers
from .models import ClientProfile, PsychologistProfile, ProfessionalDocument, Schedule
from django.contrib.auth import get_user_model

User = get_user_model()

class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer para información básica del usuario"""
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name')
        read_only_fields = ('id', 'email')

class ClientProfileSerializer(serializers.ModelSerializer):
    """Serializer para perfil de cliente"""
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = ClientProfile
        fields = ('id', 'user', 'profile_image', 'phone_number', 'birth_date', 'emergency_contact')
        read_only_fields = ('id', 'created_at', 'updated_at')

class ProfessionalDocumentSerializer(serializers.ModelSerializer):
    """Serializer para documentos profesionales"""
    class Meta:
        model = ProfessionalDocument
        fields = ('id', 'document_type', 'file', 'description', 'is_verified', 'uploaded_at')
        read_only_fields = ('id', 'is_verified', 'uploaded_at')

class ScheduleSerializer(serializers.ModelSerializer):
    """Serializer para horario del psicólogo"""
    class Meta:
        model = Schedule
        fields = ('id', 'schedule_config')

class PsychologistProfileSerializer(serializers.ModelSerializer):
    """Serializer completo para perfil de psicólogo"""
    user = UserBasicSerializer(read_only=True)
    documents = ProfessionalDocumentSerializer(many=True, read_only=True)
    schedule = ScheduleSerializer(read_only=True)
    
    class Meta:
        model = PsychologistProfile
        fields = (
            'id', 'user', 'profile_image', 'rut', 'phone', 'gender', 'region', 'city',
            'professional_title', 'specialties', 'health_register_number', 'university',
            'graduation_year', 'experience_description', 'target_populations', 
            'intervention_areas', 'is_verified', 'verification_status', 'documents', 
            'schedule'
        )
        read_only_fields = ('id', 'is_verified', 'verification_status', 'created_at', 'updated_at')

class PsychologistProfileBasicSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listado de psicólogos"""
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = PsychologistProfile
        fields = (
            'id', 'user', 'profile_image', 'professional_title', 
            'specialties', 'is_verified'
        )
        read_only_fields = fields