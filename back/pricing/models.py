from django.db import models
from django.conf import settings
from profiles.models import PsychologistProfile

class PriceConfiguration(models.Model):
    """Configuration for pricing system"""
    min_price = models.IntegerField(default=5000)
    max_price = models.IntegerField(null=True, blank=True)
    platform_fee_percentage = models.IntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Price Configuration"
        verbose_name_plural = "Price Configurations"

    def __str__(self):
        return f"Price Config (Min: {self.min_price}, Fee: {self.platform_fee_percentage}%)"


class PsychologistPrice(models.Model):
    """Model for storing psychologist prices"""
    psychologist = models.ForeignKey(
        PsychologistProfile,
        on_delete=models.CASCADE,
        related_name='prices'
    )
    price = models.IntegerField()
    is_approved = models.BooleanField(default=False)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Psychologist Price"
        verbose_name_plural = "Psychologist Prices"

    def __str__(self):
        return f"Price for {self.psychologist.user.get_full_name()}: ${self.price}"


class SuggestedPrice(models.Model):
    """Suggested price by psychologist"""
    psychologist = models.ForeignKey(PsychologistProfile, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)  # Nuevo campo
    price = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.psychologist.user.get_full_name()} - {self.price}"


class PriceChangeRequest(models.Model):
    """Model for price change requests from psychologists"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    psychologist = models.ForeignKey(
        PsychologistProfile,
        on_delete=models.CASCADE,
        related_name='price_change_requests'
    )
    current_price = models.IntegerField()
    requested_price = models.IntegerField()
    justification = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Price Change Request"
        verbose_name_plural = "Price Change Requests"

    def __str__(self):
        return f"Price change request from {self.psychologist.user.get_full_name()}: ${self.current_price} → ${self.requested_price}"
