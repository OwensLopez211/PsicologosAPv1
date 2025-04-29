from django.db import models
from authentication.models import User
from profiles.models import PsychologistProfile, ClientProfile

class Appointment(models.Model):
    """
    Modelo para citas entre clientes y psicólogos.
    """
    # Relaciones
    psychologist = models.ForeignKey(
        PsychologistProfile, 
        on_delete=models.CASCADE,
        related_name='appointments',
        help_text="Psicólogo que atenderá la cita"
    )
    client = models.ForeignKey(
        ClientProfile, 
        on_delete=models.CASCADE,
        related_name='appointments',
        help_text="Cliente que solicita la cita"
    )
    
    # Información de la cita
    date = models.DateField(help_text="Fecha de la cita")
    start_time = models.TimeField(help_text="Hora de inicio de la cita")
    end_time = models.TimeField(help_text="Hora de fin de la cita")
    
    # Estados de la cita
    STATUS_CHOICES = [
        ('PENDING_PAYMENT', 'Pendiente de Pago'),
        ('PAYMENT_UPLOADED', 'Comprobante Subido'),
        ('PAYMENT_VERIFIED', 'Pago Verificado'),
        ('CONFIRMED', 'Confirmada'),
        ('COMPLETED', 'Completada'),
        ('CANCELLED', 'Cancelada'),
        ('NO_SHOW', 'No Asistió'),
    ]
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING_PAYMENT',
        help_text="Estado actual de la cita"
    )
    
    # Información de pago
    payment_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Monto a pagar por la cita"
    )
    payment_proof = models.FileField(
        upload_to='payment_proofs/',
        null=True,
        blank=True,
        help_text="Comprobante de pago subido por el cliente"
    )
    payment_verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_appointments',
        help_text="Administrador que verificó el pago"
    )
    
    # Notas y comentarios
    client_notes = models.TextField(
        blank=True,
        null=True,
        help_text="Notas adicionales proporcionadas por el cliente"
    )
    psychologist_notes = models.TextField(
        blank=True,
        null=True,
        help_text="Notas privadas del psicólogo sobre la cita"
    )
    admin_notes = models.TextField(
        blank=True,
        null=True,
        help_text="Notas administrativas sobre la cita"
    )
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Nuevo campo
    is_first_appointment = models.BooleanField(
        default=False,
        help_text="Indica si esta cita es la primera entre el cliente y el psicólogo"
    )
    
    class Meta:
        verbose_name = "Cita"
        verbose_name_plural = "Citas"
        ordering = ['-date', 'start_time']
        # Asegurar que no haya citas duplicadas para el mismo psicólogo en el mismo horario
        unique_together = ['psychologist', 'date', 'start_time']
    
    def __str__(self):
        return f"Cita: {self.client.user.get_full_name()} con {self.psychologist.user.get_full_name()} - {self.date} {self.start_time}"

    def save(self, *args, **kwargs):
        if self._state.adding:
            exists = Appointment.objects.filter(
                psychologist=self.psychologist,
                client=self.client
            ).exclude(pk=self.pk).exists()
            self.is_first_appointment = not exists
        super().save(*args, **kwargs)
