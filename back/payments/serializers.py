from rest_framework import serializers
from .models import PaymentDetail

class PaymentDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentDetail
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')