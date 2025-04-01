from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ClientProfile, PsychologistProfile, ProfessionalDocument, Schedule
from .serializers import (
    ClientProfileSerializer, PsychologistProfileSerializer,
    PsychologistProfileBasicSerializer, ProfessionalDocumentSerializer,
    ScheduleSerializer, UserBasicSerializer  # Add UserBasicSerializer here
)
from .permissions import IsProfileOwner, IsAdminUser

class ClientProfileViewSet(viewsets.ModelViewSet):
    """API endpoint para perfil de cliente"""
    serializer_class = ClientProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsProfileOwner | IsAdminUser]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'admin':
            return ClientProfile.objects.all()
        return ClientProfile.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get', 'patch', 'put'])
    def me(self, request):
        """Endpoint para obtener o actualizar el perfil del usuario autenticado"""
        user = self.request.user
        if user.user_type != 'client':
            return Response(
                {"detail": "Este endpoint es solo para clientes."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = ClientProfile.objects.get(user=user)
        
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        
        # Para PATCH o PUT
        # Extract user data from request
        user_data = {}
        profile_data = request.data.copy()
        
        # Move user-related fields to user_data
        for field in ['first_name', 'last_name']:
            if field in profile_data:
                user_data[field] = profile_data.pop(field)
        
        # Update user if needed
        if user_data:
            user_serializer = UserBasicSerializer(user, data=user_data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
            else:
                return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Update profile
        serializer = self.get_serializer(profile, data=profile_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Return the complete updated profile
            updated_serializer = self.get_serializer(profile)
            return Response(updated_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PsychologistProfileViewSet(viewsets.ModelViewSet):
    """API endpoint para perfil de psicólogo"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PsychologistProfileBasicSerializer
        return PsychologistProfileSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'admin':
            return PsychologistProfile.objects.all()
        elif user.user_type == 'client':
            # Los clientes solo pueden ver psicólogos verificados
            return PsychologistProfile.objects.filter(is_verified=True)
        return PsychologistProfile.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def upload_document(self, request, pk=None):
        """Endpoint para subir documentos profesionales"""
        profile = self.get_object()
        
        # Verificar permiso
        if request.user != profile.user and request.user.user_type != 'admin':
            return Response(
                {"detail": "No tienes permiso para subir documentos a este perfil."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ProfessionalDocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(psychologist=profile)
            
            # Si es el primer documento, actualizar estado de verificación
            if profile.verification_status == 'PENDING':
                profile.verification_status = 'DOCUMENTS_SUBMITTED'
                profile.save()
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get', 'patch', 'put'])
    def me(self, request):
        """Endpoint para obtener o actualizar el perfil del psicólogo autenticado"""
        user = self.request.user
        if user.user_type != 'psychologist':
            return Response(
                {"detail": "Este endpoint es solo para psicólogos."},
                status=status.HTTP_403_FORBIDDEN
            )
                
        profile = PsychologistProfile.objects.get(user=user)
        
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        
        # Para PATCH o PUT
        # Extract user data from request
        user_data = {}
        profile_data = request.data.copy()
        
        # Move user-related fields to user_data
        for field in ['first_name', 'last_name']:
            if field in profile_data:
                user_data[field] = profile_data.pop(field)
        
        # Handle graduation_year specifically
        if 'graduation_year' in profile_data:
            try:
                if profile_data['graduation_year'] == '' or profile_data['graduation_year'] is None:
                    profile_data['graduation_year'] = None
                else:
                    profile_data['graduation_year'] = int(profile_data['graduation_year'])
            except (ValueError, TypeError):
                return Response(
                    {"graduation_year": ["Introduzca un número entero válido."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Update user if needed
        if user_data:
            user_serializer = UserBasicSerializer(user, data=user_data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
            else:
                return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Update profile
        serializer = self.get_serializer(profile, data=profile_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Return the complete updated profile
            updated_serializer = self.get_serializer(profile)
            return Response(updated_serializer.data)
        
        # Return detailed validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def upload_image(self, request):
        """Endpoint para subir imagen de perfil"""
        user = self.request.user
        if user.user_type != 'psychologist':
            return Response(
                {"detail": "Este endpoint es solo para psicólogos."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = PsychologistProfile.objects.get(user=user)
        
        if 'profile_image' not in request.FILES:
            return Response(
                {"detail": "No se ha proporcionado ninguna imagen."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        profile.profile_image = request.FILES['profile_image']
        profile.save()
        
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
# Añadir las vistas públicas que faltan
# Fix these view methods to use verification_status instead of is_verified
class PublicPsychologistListView(generics.ListAPIView):
    """API endpoint para listar psicólogos públicamente"""
    serializer_class = PsychologistProfileBasicSerializer
    permission_classes = []  # Acceso público
    
    def get_queryset(self):
        # Solo mostrar psicólogos verificados
        return PsychologistProfile.objects.filter(verification_status='VERIFIED')  # Changed from is_verified=True

class PsychologistDetailView(generics.RetrieveAPIView):
    """API endpoint para ver detalles de un psicólogo públicamente"""
    serializer_class = PsychologistProfileSerializer
    permission_classes = []  # Acceso público
    
    def get_queryset(self):
        # Solo mostrar psicólogos verificados
        return PsychologistProfile.objects.filter(verification_status='VERIFIED')  # Changed from is_verified=True
    
    @action(detail=True, methods=['put', 'patch'])
    def update_schedule(self, request, pk=None):
        """Endpoint para actualizar horario del psicólogo"""
        profile = self.get_object()
        
        # Verificar permiso
        if request.user != profile.user and request.user.user_type != 'admin':
            return Response(
                {"detail": "No tienes permiso para modificar el horario de este psicólogo."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener o crear horario
        schedule, created = Schedule.objects.get_or_create(psychologist=profile)
        
        serializer = ScheduleSerializer(schedule, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@action(detail=False, methods=['patch'])
def update_professional_info(self, request):
    """Endpoint para actualizar información profesional del psicólogo"""
    user = self.request.user
    if user.user_type != 'psychologist':
        return Response(
            {"detail": "Este endpoint es solo para psicólogos."},
            status=status.HTTP_403_FORBIDDEN
        )
        
    profile = PsychologistProfile.objects.get(user=user)
    
    # Campos permitidos para actualización profesional
    allowed_fields = [
        'professional_title', 'specialties', 'health_register_number', 
        'university', 'graduation_year', 'experience_description', 
        'target_populations', 'intervention_areas'
    ]
    
    # Filtrar solo los campos permitidos
    professional_data = {k: v for k, v in request.data.items() if k in allowed_fields}
    
    serializer = self.get_serializer(profile, data=professional_data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)