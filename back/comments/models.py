from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from profiles.models import PsychologistProfile, ClientProfile
from appointments.models import Appointment

class Comment(models.Model):
    """
    Modelo para gestionar comentarios de pacientes sobre psicólogos.
    Solo se permite un comentario por cita completada.
    """
    psychologist = models.ForeignKey(
        PsychologistProfile,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="Psicólogo que recibe el comentario"
    )
    patient = models.ForeignKey(
        ClientProfile,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="Paciente que hace el comentario"
    )
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name='comment',
        help_text="Cita a la que se refiere el comentario"
    )
    text = models.TextField(
        help_text="Contenido del comentario"
    )
    rating = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1, "La calificación mínima es 1"),
            MaxValueValidator(5, "La calificación máxima es 5")
        ],
        help_text="Calificación del 1 al 5"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha y hora de creación del comentario"
    )
    approved = models.BooleanField(
        default=False,
        help_text="Indica si el comentario ha sido aprobado por un administrador"
    )
    
    class Meta:
        verbose_name = "Comentario"
        verbose_name_plural = "Comentarios"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comentario de {self.patient.user.get_full_name()} sobre {self.psychologist.user.get_full_name()} - {self.rating}/5"
