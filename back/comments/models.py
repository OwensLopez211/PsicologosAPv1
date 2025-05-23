from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from profiles.models import PsychologistProfile, ClientProfile
from appointments.models import Appointment
from django.utils import timezone
from datetime import timedelta

class Comment(models.Model):
    """
    Modelo para gestionar valoraciones de pacientes sobre psicólogos.
    Solo se permite una valoración por cita completada.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pendiente'),
        ('APPROVED', 'Aprobado'),
        ('REJECTED', 'Rechazado'),
    ]

    psychologist = models.ForeignKey(
        'profiles.PsychologistProfile',
        on_delete=models.CASCADE,
        related_name='received_reviews'
    )
    patient = models.ForeignKey(
        'profiles.ClientProfile',
        on_delete=models.CASCADE,
        related_name='given_reviews'
    )
    appointment = models.OneToOneField(
        'appointments.Appointment',
        on_delete=models.CASCADE,
        related_name='review'
    )
    comment = models.TextField(
        blank=True,
        default='',
        help_text='Comentario o descripción de la valoración'
    )
    rating = models.IntegerField(
        validators=[
            MinValueValidator(1, message='La calificación mínima es 1'),
            MaxValueValidator(5, message='La calificación máxima es 5')
        ],
        help_text='Calificación del 1 al 5'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='Fecha y hora de creación de la valoración'
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='PENDING',
        help_text='Estado de la valoración'
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Valoración'
        verbose_name_plural = 'Valoraciones'
    
    def __str__(self):
        return f'Valoración de {self.patient.user.get_full_name()} para {self.psychologist.user.get_full_name()}'

    def can_comment(self):
        """
        Retorna True si la valoración puede ser creada (dentro de los 3 días posteriores a la cita completada)
        """
        if self.appointment.status != 'COMPLETED':
            return False
        completed_date = self.appointment.date
        now = timezone.now().date()
        return (now - completed_date) <= timedelta(days=3)
