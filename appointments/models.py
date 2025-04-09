from django.db import models
from django.utils import timezone
from authentication.models import User
from profiles.models import PsychologistProfile
from datetime import datetime, time

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pendiente'),
        ('CONFIRMED', 'Confirmada'),
        ('CANCELLED', 'Cancelada'),
        ('COMPLETED', 'Completada'),
        ('PAYMENT_PENDING', 'Pago Pendiente'),
    ]

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_appointments')
    psychologist = models.ForeignKey(
        PsychologistProfile, 
        on_delete=models.CASCADE, 
        related_name='psychologist_appointments',
        db_column='psychologist_id'
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    notes = models.TextField(blank=True, null=True, help_text="Notas del cliente para el psicólogo")
    client_notes = models.TextField(blank=True, null=True, help_text="Notas privadas del cliente")
    psychologist_notes = models.TextField(blank=True, null=True, help_text="Notas privadas del psicólogo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Campos para el proceso de pago
    payment_id = models.CharField(max_length=100, blank=True, null=True)
    payment_status = models.CharField(max_length=20, blank=True, null=True)
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    payment_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-date', '-start_time']
        verbose_name = "Cita"
        verbose_name_plural = "Citas"

    def __str__(self):
        return f"Cita con {self.psychologist.user.get_full_name()} el {self.date} a las {self.start_time}"
    
    def save(self, *args, **kwargs):
        # Si es una cita nueva y el estado es PENDING, establecer el estado a PAYMENT_PENDING
        if not self.pk and self.status == 'PENDING':
            self.status = 'PAYMENT_PENDING'
        super().save(*args, **kwargs)
        self.clean()
        super().save(*args, **kwargs)