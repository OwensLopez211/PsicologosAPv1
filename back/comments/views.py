from django.shortcuts import get_object_or_404
from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from .models import Comment
from .serializers import CommentSerializer, CommentReadSerializer
from profiles.models import ClientProfile, PsychologistProfile

class IsClientOwner(permissions.BasePermission):
    """
    Permiso personalizado que solo permite a los usuarios pacientes comentar sus propias citas.
    """
    def has_permission(self, request, view):
        # Solo permitir acceso a usuarios autenticados
        return request.user.is_authenticated and hasattr(request.user, 'clientprofile_profile')
    
    def has_object_permission(self, request, view, obj):
        # Verificar que el usuario es el dueño del comentario
        return obj.patient.user == request.user

class IsAdminUser(permissions.BasePermission):
    """
    Permiso que solo permite a administradores acceder a las vistas.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff

class CommentCreateView(generics.CreateAPIView):
    """
    Vista para crear comentarios. Solo accesible para pacientes.
    """
    serializer_class = CommentSerializer
    permission_classes = [IsClientOwner]
    
    def perform_create(self, serializer):
        # Obtener el perfil del cliente
        client_profile = get_object_or_404(ClientProfile, user=self.request.user)
        
        # Prefijo los datos con el cliente actual
        serializer.save(patient=client_profile)

class CommentListByPsychologistView(generics.ListAPIView):
    """
    Vista para listar comentarios aprobados por psicólogo.
    Esta vista es pública.
    """
    serializer_class = CommentReadSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        psychologist_id = self.kwargs.get('psychologist_id')
        return Comment.objects.filter(
            psychologist_id=psychologist_id,
            approved=True
        ).order_by('-created_at')

class CommentAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet para administradores para gestionar todos los comentarios.
    """
    queryset = Comment.objects.all()
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return CommentReadSerializer
        return CommentSerializer
    
    def perform_update(self, serializer):
        """
        Administradores pueden actualizar cualquier campo, incluido 'approved'.
        """
        serializer.save()
    
    def perform_destroy(self, instance):
        """
        Administradores pueden eliminar comentarios.
        """
        instance.delete()

class ClientCommentListView(generics.ListAPIView):
    """
    Vista para que los clientes vean sus propios comentarios.
    """
    serializer_class = CommentReadSerializer
    permission_classes = [IsClientOwner]
    
    def get_queryset(self):
        client_profile = get_object_or_404(ClientProfile, user=self.request.user)
        return Comment.objects.filter(patient=client_profile).order_by('-created_at')
