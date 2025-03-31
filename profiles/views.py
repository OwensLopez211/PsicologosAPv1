from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ClientProfile, PsychologistProfile, ProfessionalDocument, Schedule
from .serializers import (
    ClientProfileSerializer, PsychologistProfileSerializer,
    PsychologistProfileBasicSerializer, ProfessionalDocumentSerializer,
    ScheduleSerializer
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

# Añadir las vistas públicas que faltan
class PublicPsychologistListView(generics.ListAPIView):
    """API endpoint para listar psicólogos públicamente"""
    serializer_class = PsychologistProfileBasicSerializer
    permission_classes = []  # Acceso público
    
    def get_queryset(self):
        # Solo mostrar psicólogos verificados
        return PsychologistProfile.objects.filter(is_verified=True)

class PsychologistDetailView(generics.RetrieveAPIView):
    """API endpoint para ver detalles de un psicólogo públicamente"""
    serializer_class = PsychologistProfileSerializer
    permission_classes = []  # Acceso público
    
    def get_queryset(self):
        # Solo mostrar psicólogos verificados
        return PsychologistProfile.objects.filter(is_verified=True)
    
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