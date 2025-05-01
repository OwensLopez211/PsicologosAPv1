from rest_framework import serializers
from .models import PriceConfiguration, PsychologistPrice, SuggestedPrice, PriceChangeRequest

class PriceConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceConfiguration
        fields = '__all__'


class PsychologistPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PsychologistPrice
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class SuggestedPriceSerializer(serializers.ModelSerializer):
    user_id = serializers.SerializerMethodField()
    
    class Meta:
        model = SuggestedPrice
        fields = ['id', 'price', 'created_at', 'updated_at', 'psychologist', 'user_id']
    
    def get_user_id(self, obj):
        return obj.psychologist.user.id
        
        class Meta:
            model = SuggestedPrice
            fields = '__all__'
            read_only_fields = ['created_at', 'updated_at']


class PriceChangeRequestSerializer(serializers.ModelSerializer):
    psychologist_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PriceChangeRequest
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'current_price', 'psychologist_name']
    
    def get_psychologist_name(self, obj):
        return obj.psychologist.user.get_full_name()
    
    def create(self, validated_data):
        # Get the current price for the psychologist
        psychologist = validated_data.get('psychologist')
        try:
            current_price = PsychologistPrice.objects.get(psychologist=psychologist).price
        except PsychologistPrice.DoesNotExist:
            current_price = 0
        
        # Set the current price in the request
        validated_data['current_price'] = current_price
        
        return super().create(validated_data)