from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer, RegisterSerializer, ChangePasswordSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer, generate_reset_token
)
from .permissions import IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from backend.email_utils import send_welcome_email, send_password_reset_email

User = get_user_model()

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = []
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        # Imprime los datos recibidos para debugging
        print(f"Register request data: {request.data}")
        
        # Verificar si el usuario está intentando registrarse como administrador
        user_type = request.data.get('user_type', 'client').lower()
        if user_type == 'admin' or user_type == 'administrador':
            return Response({
                'detail': 'No está permitido crear cuentas de administrador',
                'error': 'ADMIN_CREATION_RESTRICTED'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Asegurarse de que first_name y last_name estén presentes y no sean None
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        
        # Verificar que no sean None antes de continuar
        if first_name is None:
            first_name = ''
        if last_name is None:
            last_name = ''
            
        data = {
            'email': request.data.get('email'),
            'username': request.data.get('email'),
            'password': request.data.get('password'),
            'password2': request.data.get('password2'),
            'user_type': user_type,
            'first_name': first_name,
            'last_name': last_name
        }
        
        # Imprimir los datos procesados para debugging
        print(f"Processed data for serializer: {data}")
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Asegurarse de que first_name y last_name se guarden correctamente
            user.first_name = first_name
            user.last_name = last_name
            user.save()
            
            # Ahora procesamos los datos adicionales para el perfil
            phone_number = request.data.get('phone_number', '')
            
            # Obtener el perfil recién creado
            if user.user_type.lower() == 'client':
                if hasattr(user, 'clientprofile_profile'):
                    profile = user.clientprofile_profile
                    profile.phone_number = phone_number
                    profile.save()
                    print(f"Updated client profile for {user.email}")
            elif user.user_type.lower() == 'psychologist':
                if hasattr(user, 'psychologistprofile_profile'):
                    profile = user.psychologistprofile_profile
                    profile.phone = phone_number
                    if 'professional_title' in request.data:
                        profile.professional_title = request.data.get('professional_title')
                    profile.save()
                    print(f"Updated psychologist profile for {user.email}")
            
            # Enviar correo de bienvenida
            try:
                send_welcome_email(user)
                print(f"Welcome email sent to {user.email}")
            except Exception as e:
                print(f"Error sending welcome email to {user.email}: {str(e)}")
            
            refresh = RefreshToken.for_user(user)
            user_serializer = UserSerializer(user)
            
            return Response({
                'user': user_serializer.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        
        # En caso de error, imprimir para debugging
        print(f"Validation errors: {serializer.errors}")
        
        return Response({
            'detail': 'Error de validación',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        user = request.user
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not user.check_password(serializer.validated_data['old_password']):
            return Response({"old_password": "Contraseña incorrecta"},
                          status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({"message": "Contraseña actualizada correctamente"})

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        serializer = UserSerializer(user)
        data['user'] = serializer.data
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom token refresh view that doesn't use OutstandingToken.
    """
    def post(self, request, *args, **kwargs):
        serializer = TokenRefreshSerializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
            
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class SendWelcomeEmailView(APIView):
    """
    Vista para enviar correos de bienvenida a usuarios existentes.
    Solo accesible para administradores.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {"detail": "Se requiere el ID del usuario"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            result = send_welcome_email(user)
            if result:
                return Response(
                    {"detail": f"Correo de bienvenida enviado a {user.email}"},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"detail": "No se pudo enviar el correo de bienvenida"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Exception as e:
            return Response(
                {"detail": f"Error al enviar el correo: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Nuevas vistas para recuperación de contraseña
class PasswordResetRequestView(APIView):
    """
    Vista para solicitar el restablecimiento de contraseña.
    No requiere autenticación.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        base_url = serializer.validated_data['base_url']
        
        try:
            user = User.objects.get(email=email)
            
            # Generar token y guardarlo en el usuario
            token = generate_reset_token(length=20)
            user.reset_password_token = token
            user.save()
            
            # Enviar correo con instrucciones
            send_password_reset_email(user, token, base_url)
            
            return Response(
                {"detail": "Se ha enviado un correo con instrucciones para restablecer tu contraseña."},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            # No debería ocurrir debido a la validación del serializer
            return Response(
                {"detail": "No existe ningún usuario con este correo electrónico."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": f"Error al procesar la solicitud: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PasswordResetConfirmView(APIView):
    """
    Vista para confirmar el restablecimiento de contraseña con token.
    No requiere autenticación.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = User.objects.get(email=email)
            
            # Verificar el token
            if user.reset_password_token != token:
                return Response(
                    {"detail": "Token inválido o expirado."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Establecer nueva contraseña
            user.set_password(new_password)
            # Limpiar el token para que no se pueda usar de nuevo
            user.reset_password_token = None
            user.save()
            
            return Response(
                {"detail": "Tu contraseña ha sido restablecida con éxito."},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"detail": "No existe ningún usuario con este correo electrónico."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": f"Error al procesar la solicitud: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )