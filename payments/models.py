from django.db import models
from appointments.models import Appointment

class PaymentDetail(models.Model):
    """
    Modelo para almacenar detalles de pago de las citas.
    """
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name='payment_detail',
        help_text="Cita asociada al pago"
    )
    
    # Detalles de la transacción
    transaction_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="ID de la transacción bancaria"
    )
    payment_date = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Fecha y hora del pago según el cliente"
    )
    payment_method = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Método de pago utilizado"
    )
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Pago para cita {self.appointment.id}"
