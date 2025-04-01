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

class ProfessionalDocumentSerializer(serializers.ModelSerializer):
    """Serializer para documentos profesionales"""
    class Meta:
        model = ProfessionalDocument
        fields = ('id', 'document_type', 'file', 'description', 'is_verified', 'uploaded_at')
        read_only_fields = ('id', 'is_verified', 'uploaded_at')

class ScheduleSerializer(serializers.ModelSerializer):
    """Serializer para horarios de psicólogos"""
    class Meta:
        model = Schedule
        fields = '__all__'
        read_only_fields = ('id', 'psychologist')

class BaseProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        fields = (
            'first_name',
            'last_name',
            'email',
            'profile_image',
        )

class ClientProfileSerializer(BaseProfileSerializer):
    phone = serializers.CharField(source='phone_number', required=False)
    
    class Meta(BaseProfileSerializer.Meta):
        model = ClientProfile
        fields = BaseProfileSerializer.Meta.fields + ('phone',)

class PsychologistProfileSerializer(BaseProfileSerializer):
    phone = serializers.CharField(required=False)
    documents = ProfessionalDocumentSerializer(many=True, read_only=True, source='professionaldocument_set')
    schedule = ScheduleSerializer(read_only=True)
    
    # Ensure these fields can handle empty values properly
    specialties = serializers.ListField(child=serializers.CharField(), required=False)
    target_populations = serializers.ListField(child=serializers.CharField(), required=False)
    intervention_areas = serializers.ListField(child=serializers.CharField(), required=False)
    graduation_year = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta(BaseProfileSerializer.Meta):
        model = PsychologistProfile
        fields = BaseProfileSerializer.Meta.fields + (
            'id', 'rut', 'phone', 'gender', 'region', 'city',
            'professional_title', 'specialties', 'health_register_number', 'university',
            'graduation_year', 'experience_description', 'target_populations', 
            'intervention_areas', 'verification_status', 'documents', 'schedule'
        )
        read_only_fields = ('id', 'verification_status', 'created_at', 'updated_at')

class PsychologistProfileBasicSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listado de psicólogos"""
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = PsychologistProfile
        fields = (
            'id', 'user', 'profile_image', 'professional_title', 
            'specialties', 'verification_status'  # Changed is_verified to verification_status
        )
        read_only_fields = fields