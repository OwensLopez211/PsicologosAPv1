from django.db import models
from appointments.models import Appointment
import datetime

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
    
    def save(self, *args, **kwargs):
        """
        Sobrescribir el método save para asegurar que los campos de fecha
        se guarden con la hora local correcta sin conversiones de zona horaria.
        """
        # Si es un objeto nuevo (sin ID), establecer created_at manualmente
        if not self.pk:
            # Desactivar auto_now_add para created_at
            for field in self._meta.fields:
                if field.name == 'created_at' and field.auto_now_add:
                    field.auto_now_add = False
            
            # Establecer created_at manualmente con la fecha/hora actual exacta
            import datetime
            self.created_at = datetime.datetime.now()
        
        # Desactivar auto_now para updated_at
        for field in self._meta.fields:
            if field.name == 'updated_at' and field.auto_now:
                field.auto_now = False
        
        # Establecer updated_at manualmente
        import datetime
        self.updated_at = datetime.datetime.now()
        
        # Llamar al método save original
        super().save(*args, **kwargs)
        
        # Restaurar auto_now y auto_now_add para mantener la funcionalidad original
        for field in self._meta.fields:
            if field.name == 'created_at':
                field.auto_now_add = True
            elif field.name == 'updated_at':
                field.auto_now = True