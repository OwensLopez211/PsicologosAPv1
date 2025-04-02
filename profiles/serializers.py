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
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    verification_status_display = serializers.CharField(source='get_verification_status_display', read_only=True)
    
    class Meta:
        model = ProfessionalDocument
        fields = (
            'id', 'document_type', 'document_type_display', 'file', 'description', 
            'is_verified', 'verification_status', 'verification_status_display', 
            'rejection_reason', 'uploaded_at', 'verified_at'
        )
        read_only_fields = (
            'id', 'is_verified', 'verification_status', 'verification_status_display', 
            'rejection_reason', 'uploaded_at', 'verified_at'
        )

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
    phone = serializers.CharField(source='phone_number', required=False, allow_blank=True, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    rut = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    region = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    city = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    user = serializers.SerializerMethodField()
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'is_active': obj.user.is_active
        }
    
    class Meta(BaseProfileSerializer.Meta):
        model = ClientProfile
        fields = BaseProfileSerializer.Meta.fields + (
            'id', 'phone', 'birth_date', 'gender', 'rut', 'region', 'city', 'user'
        )
        read_only_fields = ('id',)

class AdminProfileSerializer(BaseProfileSerializer):
    """Serializer para perfiles de administrador"""
    phone = serializers.CharField(source='phone_number', required=False, allow_blank=True, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    rut = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    region = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    city = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    class Meta(BaseProfileSerializer.Meta):
        model = ClientProfile  # Usamos ClientProfile como base para el admin
        fields = BaseProfileSerializer.Meta.fields + (
            'id', 'phone', 'gender', 'rut', 'region', 'city'
        )
        read_only_fields = ('id',)

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

class PsychologistProfileBasicSerializer(BaseProfileSerializer):
    """Serializer básico para listado de psicólogos"""
    id = serializers.IntegerField(source='user.id', read_only=True)
    name = serializers.SerializerMethodField()
    university = serializers.CharField(required=False)
    specialties = serializers.ListField(child=serializers.CharField(), required=False)
    experience = serializers.SerializerMethodField()
    
    class Meta(BaseProfileSerializer.Meta):
        model = PsychologistProfile
        fields = BaseProfileSerializer.Meta.fields + (
            'id', 'name', 'university', 'specialties', 'experience', 
            'professional_title', 'verification_status'
        )
    
    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_experience(self, obj):
        # Calculate years of experience if graduation_year is available
        if obj.graduation_year:
            import datetime
            current_year = datetime.datetime.now().year
            years = current_year - obj.graduation_year
            return f"{years} años"
        return ""

class PsychologistProfileSerializer(PsychologistProfileBasicSerializer):
    """Serializer completo para detalles de psicólogo"""
    documents = ProfessionalDocumentSerializer(many=True, read_only=True, source='professionaldocument_set')
    schedule = ScheduleSerializer(read_only=True)
    
    class Meta(PsychologistProfileBasicSerializer.Meta):
        model = PsychologistProfile
        fields = PsychologistProfileBasicSerializer.Meta.fields + (
            'rut', 'phone', 'gender', 'region', 'city', 'health_register_number',
            'graduation_year', 'experience_description', 'target_populations',
            'intervention_areas', 'documents', 'schedule', 'verification_status'
        )