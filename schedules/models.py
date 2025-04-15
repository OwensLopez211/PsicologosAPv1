from django.db import models
from profiles.models import PsychologistProfile
from authentication.models import User

class Schedule(models.Model):
    """
    Modelo para horarios de psicólogos.
    Define los días y horas en que un psicólogo está disponible.
    """
    psychologist = models.ForeignKey(
        PsychologistProfile, 
        on_delete=models.CASCADE, 
        related_name='schedules'
    )
    
    # Campo para almacenar el ID del usuario autenticado
    user_id = models.IntegerField(
        null=True, 
        blank=True,
        help_text="ID del usuario autenticado que creó o actualizó este horario"
    )
    
    # Días de la semana
    DAYS_OF_WEEK = [
        ('MONDAY', 'Lunes'),
        ('TUESDAY', 'Martes'),
        ('WEDNESDAY', 'Miércoles'),
        ('THURSDAY', 'Jueves'),
        ('FRIDAY', 'Viernes'),
        ('SATURDAY', 'Sábado'),
        ('SUNDAY', 'Domingo'),
    ]
    
    day_of_week = models.CharField(
        max_length=10,
        choices=DAYS_OF_WEEK,
        help_text="Día de la semana"
    )
    
    start_time = models.TimeField(help_text="Hora de inicio")
    end_time = models.TimeField(help_text="Hora de fin")
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Horario"
        verbose_name_plural = "Horarios"
        # Asegurar que no haya horarios duplicados para el mismo psicólogo
        unique_together = ['psychologist', 'day_of_week', 'start_time', 'end_time']
        ordering = ['day_of_week', 'start_time']
    
    def __str__(self):
        return f"{self.psychologist.user.get_full_name()} - {self.get_day_of_week_display()} {self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}"
