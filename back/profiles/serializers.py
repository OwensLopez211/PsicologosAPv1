from rest_framework import serializers
from .models import ClientProfile, PsychologistProfile, ProfessionalDocument, AdminProfile, ProfessionalExperience
from django.contrib.auth import get_user_model
from django.db import connection

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

# Rest of the serializers remain unchanged
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
    
    # Add bank info fields
    bank_account_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bank_account_type = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bank_account_owner = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bank_account_owner_rut = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bank_account_owner_email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    bank_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
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
            'id', 'phone', 'birth_date', 'gender', 'rut', 'region', 'city', 'user',
            'bank_account_number', 'bank_account_type', 'bank_account_owner',
            'bank_account_owner_rut', 'bank_account_owner_email', 'bank_name'
        )
        read_only_fields = ('id',)

class AdminProfileSerializer(BaseProfileSerializer):
    """Serializer para perfiles de administrador"""
    phone = serializers.CharField(source='phone_number', required=False, allow_blank=True, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    rut = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    region = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    city = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    # Add bank info fields
    bank_account_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bank_account_type = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bank_account_owner = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bank_account_owner_rut = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bank_account_owner_email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    bank_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    class Meta(BaseProfileSerializer.Meta):
        model = AdminProfile  # Changed from ClientProfile to AdminProfile
        fields = BaseProfileSerializer.Meta.fields + (
            'id', 'phone', 'gender', 'rut', 'region', 'city',
            'bank_account_number', 'bank_account_type', 'bank_account_owner',
            'bank_account_owner_rut', 'bank_account_owner_email', 'bank_name'
        )
        read_only_fields = ('id',)

class ProfessionalExperienceSerializer(serializers.ModelSerializer):
    """Serializer para experiencias profesionales de psicólogos"""
    experience_type_display = serializers.CharField(source='get_experience_type_display', read_only=True)
    
    class Meta:
        model = ProfessionalExperience
        fields = (
            'id', 'experience_type', 'experience_type_display', 'institution', 
            'role', 'start_date', 'end_date', 'description'
        )
        read_only_fields = ('id',)

class PsychologistProfileSerializer(BaseProfileSerializer):
    """Serializer para perfiles de psicólogo"""
    phone = serializers.CharField(source='phone_number', required=False, allow_blank=True, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    rut = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    region = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    city = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    user = serializers.SerializerMethodField()
    presentation_video_url = serializers.SerializerMethodField(read_only=True)
    experiences = ProfessionalExperienceSerializer(many=True, read_only=True)
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'is_active': obj.user.is_active
        }
    
    def get_presentation_video_url(self, obj):
        # This will be populated by the view, but we include it here for schema generation
        return None
    
    class Meta(BaseProfileSerializer.Meta):
        model = PsychologistProfile
        fields = BaseProfileSerializer.Meta.fields + (
            'id', 'phone', 'gender', 'rut', 'region', 'city', 'user',
            'professional_title', 'health_register_number', 'university',
            'graduation_year', 'specialties', 'target_populations', 
            'intervention_areas', 'verification_status',
            'presentation_video_url', 'experiences'
        )
        read_only_fields = ('id', 'verification_status')
    documents = ProfessionalDocumentSerializer(many=True, read_only=True, source='professionaldocument_set')
    
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
            'graduation_year', 'target_populations', 'intervention_areas', 
            'verification_status', 'documents', 'experiences'
        )
        read_only_fields = ('id', 'verification_status', 'created_at', 'updated_at')

class PsychologistProfileBasicSerializer(BaseProfileSerializer):
    """Serializer básico para listado de psicólogos"""
    id = serializers.IntegerField(source='user.id', read_only=True)
    name = serializers.SerializerMethodField()
    university = serializers.CharField(required=False)
    specialties = serializers.ListField(child=serializers.CharField(), required=False)
    experience = serializers.SerializerMethodField()
    gender = serializers.CharField(read_only=True)  # Add gender field
    
    class Meta(BaseProfileSerializer.Meta):
        model = PsychologistProfile
        fields = BaseProfileSerializer.Meta.fields + (
            'id', 'name', 'university', 'specialties', 'experience', 
            'professional_title', 'verification_status', 'gender'  # Include gender in fields
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
    """Serializer para perfil de psicólogo con datos completos"""
    user = UserBasicSerializer(read_only=True)
    verification_status_display = serializers.CharField(source='get_verification_status_display', read_only=True)
    bank_account_type_display = serializers.CharField(source='get_bank_account_type_display', read_only=True)
    experiences = ProfessionalExperienceSerializer(many=True, read_only=True)
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'is_active': obj.user.is_active
        }
    
    class Meta(BaseProfileSerializer.Meta):
        model = PsychologistProfile
        fields = (
            'id', 'user', 'profile_image', 'rut', 'phone', 'gender', 'region', 'city',
            'professional_title', 'specialties', 'health_register_number', 'university',
            'graduation_year', 'target_populations', 'intervention_areas',
            'verification_status', 'verification_status_display', 'created_at', 'updated_at',
            'bank_account_number', 'bank_account_type', 'bank_account_type_display', 
            'bank_account_owner', 'bank_account_owner_rut', 'bank_account_owner_email', 'bank_name',
            'experiences'
        )
        read_only_fields = ('id', 'user', 'verification_status', 'verification_status_display', 'created_at', 'updated_at')
