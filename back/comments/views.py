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
from appointments.serializers import AppointmentSerializer
import logging

logger = logging.getLogger(__name__)

class IsClientOwner(permissions.BasePermission):
    """
    Permiso personalizado que solo permite a los usuarios pacientes comentar sus propias citas.
    """
    def has_permission(self, request, view):
        print(f"Checking client permission for user: {request.user}, type: {request.user.user_type}")
        return request.user.is_authenticated and request.user.user_type == 'client'
    
    def has_object_permission(self, request, view, obj):
        return obj.patient.user == request.user

class IsPsychologistOwner(permissions.BasePermission):
    """
    Permiso que solo permite a los psicólogos ver sus propias valoraciones.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'psychologist'

class IsAdminUser(permissions.BasePermission):
    """
    Permiso que solo permite a administradores acceder a las vistas.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'admin'

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
    serializer_class = AppointmentSerializer
    permission_classes = [IsClientOwner]
    
    def get_queryset(self):
        print(f"Getting pending appointments for user: {self.request.user}")
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
    
    def post(self, request, *args, **kwargs):
        logger.info(f"Received data for CommentCreateView: {request.data}")
        return super().post(request, *args, **kwargs) # Esto llama a perform_create si es válido

    def perform_create(self, serializer):
        logger.info("Serializer is valid. Performing create.")
        try:
            client_profile = get_object_or_404(ClientProfile, user=self.request.user)
            logger.info(f"Found client profile: {client_profile.id}")

            # Obtener el objeto Appointment completo desde los datos validados
            appointment = serializer.validated_data['appointment']
            # Obtener el psicólogo de la cita
            psychologist_profile = appointment.psychologist

            # Guardar el comentario, pasando tanto el paciente como el psicólogo
            serializer.save(patient=client_profile, psychologist=psychologist_profile)
            logger.info("Comment saved successfully.")
        except Exception as e:
            logger.error(f"Error during perform_create: {e}", exc_info=True)
            # Relanzar la excepción para que DRF la maneje (resultará en un 500)
            raise e

class ClientCommentListView(generics.ListAPIView):
    """
    Vista para que los clientes vean sus propias valoraciones.
    """
    serializer_class = CommentReadSerializer
    permission_classes = [IsClientOwner]
    
    def get_queryset(self):
        print(f"Getting reviews for client: {self.request.user}")
        client_profile = get_object_or_404(ClientProfile, user=self.request.user)
        return Comment.objects.filter(patient=client_profile).order_by('-created_at')

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
            status='APPROVED'
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
        Administradores pueden actualizar cualquier campo, incluido 'status'.
        """
        # Log para ver qué datos llegan en la solicitud PATCH/PUT
        logger.info(f"Received data for CommentAdminViewSet update: {self.request.data}")
        serializer.save()
    
    def perform_destroy(self, instance):
        """
        Administradores pueden eliminar comentarios.
        """
        instance.delete()
