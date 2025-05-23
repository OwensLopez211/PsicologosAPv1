from django.shortcuts import get_object_or_404
from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from django.db.models import Avg, Count
from django.utils import timezone
from datetime import timedelta
from .models import Comment
from .serializers import CommentSerializer, CommentReadSerializer
from profiles.models import ClientProfile, PsychologistProfile
from appointments.models import Appointment

class IsClientOwner(permissions.BasePermission):
    """
    Permiso personalizado que solo permite a los usuarios pacientes comentar sus propias citas.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'clientprofile_profile')
    
    def has_object_permission(self, request, view, obj):
        return obj.patient.user == request.user

class IsPsychologistOwner(permissions.BasePermission):
    """
    Permiso que solo permite a los psicólogos ver sus propias valoraciones.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'psychologistprofile_profile')

class IsAdminUser(permissions.BasePermission):
    """
    Permiso que solo permite a administradores acceder a las vistas.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff

class PsychologistReviewsView(generics.ListAPIView):
    """
    Vista para que los psicólogos vean sus valoraciones y estadísticas.
    """
    serializer_class = CommentReadSerializer
    permission_classes = [IsPsychologistOwner]
    
    def get_queryset(self):
        psychologist_profile = get_object_or_404(PsychologistProfile, user=self.request.user)
        return Comment.objects.filter(psychologist=psychologist_profile)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        reviews = self.get_serializer(queryset, many=True).data
        
        # Calcular estadísticas
        stats = {
            'total_reviews': queryset.count(),
            'average_rating': queryset.aggregate(Avg('rating'))['rating__avg'] or 0.0,
            'rating_distribution': {
                rating: queryset.filter(rating=rating).count()
                for rating in range(1, 6)
            }
        }
        
        return Response({
            'reviews': reviews,
            'stats': stats
        })

class PendingAppointmentsView(generics.ListAPIView):
    """
    Vista para obtener las citas pendientes de valorar por el cliente.
    """
    serializer_class = CommentSerializer
    permission_classes = [IsClientOwner]
    
    def get_queryset(self):
        client_profile = get_object_or_404(ClientProfile, user=self.request.user)
        three_days_ago = timezone.now() - timedelta(days=3)
        
        # Obtener citas completadas en los últimos 3 días que no tienen valoración
        return Appointment.objects.filter(
            client=client_profile,
            status='COMPLETED',
            date__gte=three_days_ago
        ).exclude(
            id__in=Comment.objects.values_list('appointment_id', flat=True)
        )

class CommentCreateView(generics.CreateAPIView):
    """
    Vista para crear valoraciones. Solo accesible para pacientes.
    """
    serializer_class = CommentSerializer
    permission_classes = [IsClientOwner]
    
    def perform_create(self, serializer):
        client_profile = get_object_or_404(ClientProfile, user=self.request.user)
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

class ClientCommentListView(generics.ListAPIView):
    """
    Vista para que los clientes vean sus propias valoraciones.
    """
    serializer_class = CommentReadSerializer
    permission_classes = [IsClientOwner]
    
    def get_queryset(self):
        client_profile = get_object_or_404(ClientProfile, user=self.request.user)
        return Comment.objects.filter(patient=client_profile).order_by('-created_at')

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
        Administradores pueden actualizar cualquier campo, incluido 'status'.
        """
        serializer.save()
    
    def perform_destroy(self, instance):
        """
        Administradores pueden eliminar comentarios.
        """
        instance.delete()
