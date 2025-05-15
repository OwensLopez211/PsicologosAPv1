from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
import secrets
import string

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    profile_id = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 
            'email', 
            'username', 
            'first_name', 
            'last_name',
            'user_type', 
            'phone_number', 
            'is_email_verified', 
            'last_login', 
            'created_at',
            'profile_id'
        )
        read_only_fields = ('is_email_verified', 'last_login', 'created_at', 'profile_id')
    
    def get_profile_id(self, obj):
        # Obtener el ID del perfil según el tipo de usuario
        if obj.user_type.lower() == 'psychologist' and hasattr(obj, 'psychologistprofile_profile'):
            return obj.psychologistprofile_profile.id
        elif obj.user_type.lower() == 'client' and hasattr(obj, 'clientprofile_profile'):
            return obj.clientprofile_profile.id
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password2', 'user_type', 'phone_number', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
        
        # Validar que no se creen usuarios administradores
        user_type = attrs.get('user_type', '').lower()
        if user_type == 'admin' or user_type == 'administrador':
            raise serializers.ValidationError({"user_type": "No está permitido crear cuentas de administrador"})
            
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

# Nuevos serializers para recuperación de contraseña
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    base_url = serializers.CharField(required=True)
    
    def validate_email(self, value):
        # Verificar que exista un usuario con este email
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No existe ningún usuario con este correo electrónico.")
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    
    def validate(self, attrs):
        email = attrs.get('email')
        token = attrs.get('token')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "No existe ningún usuario con este correo electrónico."})
        
        if user.reset_password_token != token:
            raise serializers.ValidationError({"token": "Token inválido o expirado."})
        
        return attrs

def generate_reset_token(length=10):
    """
    Genera un token aleatorio para recuperación de contraseña
    """
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))