from rest_framework import serializers
from .models import PriceConfiguration, PsychologistPrice, PriceChangeRequest, PromotionalDiscount
from profiles.serializers import PsychologistProfileSerializer

class PriceConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceConfiguration
        fields = ['id', 'min_price', 'max_price', 'platform_fee_percentage', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class PsychologistPriceSerializer(serializers.ModelSerializer):
    psychologist_details = PsychologistProfileSerializer(source='psychologist', read_only=True)
    
    class Meta:
        model = PsychologistPrice
        fields = ['id', 'psychologist', 'price', 'is_approved', 'admin_notes', 'created_at', 'updated_at', 'psychologist_details']
        read_only_fields = ['created_at', 'updated_at']

class PriceChangeRequestSerializer(serializers.ModelSerializer):
    psychologist_details = PsychologistProfileSerializer(source='psychologist', read_only=True)
    
    class Meta:
        model = PriceChangeRequest
        fields = ['id', 'psychologist', 'current_price', 'requested_price', 'justification', 'status', 'admin_notes', 'created_at', 'updated_at', 'psychologist_details']
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_requested_price(self, value):
        # Get the current price configuration
        try:
            config = PriceConfiguration.objects.latest('updated_at')
            if value > config.max_price:
                raise serializers.ValidationError(f"El precio solicitado no puede ser mayor a {config.max_price} CLP")
            if value < config.min_price:
                raise serializers.ValidationError(f"El precio solicitado no puede ser menor a {config.min_price} CLP")
        except PriceConfiguration.DoesNotExist:
            # If no configuration exists, use the default max value from the model
            if value > 15000:
                raise serializers.ValidationError("El precio solicitado no puede ser mayor a 15000 CLP")
        return value

class PromotionalDiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromotionalDiscount
        fields = ['id', 'name', 'code', 'discount_percentage', 'start_date', 'end_date', 'max_uses', 'current_uses', 'is_active', 'created_at']
        read_only_fields = ['current_uses', 'created_at']
    
    def validate(self, data):
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("La fecha de inicio debe ser anterior a la fecha de fin")
        return data