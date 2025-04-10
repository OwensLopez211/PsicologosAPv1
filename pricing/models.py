from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from profiles.models import PsychologistProfile
from django.utils import timezone

class PriceConfiguration(models.Model):
    """
    Configuración global de precios para la plataforma
    """
    min_price = models.PositiveIntegerField(
        default=5000,
        validators=[MinValueValidator(0)],
        help_text="Precio mínimo permitido en CLP"
    )
    max_price = models.PositiveIntegerField(
        default=15000,
        validators=[MinValueValidator(0)],
        help_text="Precio máximo permitido en CLP"
    )
    platform_fee_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Porcentaje de comisión de la plataforma"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Configuración de Precios"
        verbose_name_plural = "Configuraciones de Precios"
    
    def __str__(self):
        return f"Configuración de Precios (Actualizado: {self.updated_at.strftime('%Y-%m-%d')})"

class PsychologistPrice(models.Model):
    """
    Precio asignado a un psicólogo por el administrador
    """
    psychologist = models.OneToOneField(
        PsychologistProfile,
        on_delete=models.CASCADE,
        related_name='assigned_price'
    )
    price = models.PositiveIntegerField(
        validators=[MinValueValidator(0)],
        help_text="Precio asignado por el administrador en CLP"
    )
    is_approved = models.BooleanField(
        default=False,
        help_text="Indica si el precio ha sido aprobado por el administrador"
    )
    admin_notes = models.TextField(
        blank=True,
        help_text="Notas del administrador sobre la decisión de precio"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Precio de Psicólogo"
        verbose_name_plural = "Precios de Psicólogos"
    
    def __str__(self):
        return f"Precio para {self.psychologist.user.get_full_name()}: {self.price} CLP"

class PriceChangeRequest(models.Model):
    """
    Solicitud de cambio de precio por parte del psicólogo
    """
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado')
    ]
    
    psychologist = models.ForeignKey(
        PsychologistProfile,
        on_delete=models.CASCADE,
        related_name='price_change_requests'
    )
    current_price = models.PositiveIntegerField(
        validators=[MinValueValidator(0)],
        help_text="Precio actual en CLP"
    )
    requested_price = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(15000)],
        help_text="Precio solicitado en CLP (máximo 15000 CLP)"
    )
    justification = models.TextField(
        help_text="Justificación para el cambio de precio"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    admin_notes = models.TextField(
        blank=True,
        help_text="Notas del administrador sobre la decisión"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Solicitud de Cambio de Precio"
        verbose_name_plural = "Solicitudes de Cambio de Precio"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Solicitud de {self.psychologist.user.get_full_name()}: {self.current_price} → {self.requested_price} CLP"

class PromotionalDiscount(models.Model):
    """
    Descuentos promocionales que pueden aplicarse a las sesiones
    """
    name = models.CharField(max_length=100, help_text="Nombre de la promoción")
    code = models.CharField(max_length=20, unique=True, help_text="Código promocional")
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Porcentaje de descuento"
    )
    start_date = models.DateTimeField(help_text="Fecha de inicio de la promoción")
    end_date = models.DateTimeField(help_text="Fecha de fin de la promoción")
    max_uses = models.PositiveIntegerField(
        default=100,
        help_text="Número máximo de usos permitidos"
    )
    current_uses = models.PositiveIntegerField(
        default=0,
        help_text="Número actual de usos"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Descuento Promocional"
        verbose_name_plural = "Descuentos Promocionales"
    
    def __str__(self):
        return f"{self.name} ({self.code}): {self.discount_percentage}%"
    
    def is_valid(self):
        now = timezone.now()
        return (
            self.is_active and
            self.start_date <= now and
            self.end_date >= now and
            self.current_uses < self.max_uses
        )
