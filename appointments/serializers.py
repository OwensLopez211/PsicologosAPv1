from rest_framework import serializers
from .models import Appointment
from payments.serializers import PaymentDetailSerializer
from profiles.serializers import ClientProfileSerializer, PsychologistProfileBasicSerializer
from django.conf import settings

class AppointmentSerializer(serializers.ModelSerializer):
    payment_detail = PaymentDetailSerializer(read_only=True)
    psychologist_name = serializers.SerializerMethodField()
    client_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    payment_proof_url = serializers.SerializerMethodField()
    client_data = serializers.SerializerMethodField()
    psychologist_data = serializers.SerializerMethodField()
    payment_verified_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'payment_verified_by')
    
    def get_psychologist_name(self, obj):
        return obj.psychologist.user.get_full_name()
    
    def get_client_name(self, obj):
        return obj.client.user.get_full_name()
    
    def get_status_display(self, obj):
        return obj.get_status_display()
        
    def get_payment_proof_url(self, obj):
        if obj.payment_proof:
            return obj.payment_proof.url
        return None
    
    def get_client_data(self, obj):
        """Obtener datos básicos del cliente"""
        client = obj.client
        return {
            'id': client.id,
            'user_id': client.user.id,
            'name': client.user.get_full_name(),
            'email': client.user.email,
            'phone': client.phone_number,
            'profile_image': client.profile_image.url if client.profile_image else None
        }
    
    def get_psychologist_data(self, obj):
        """Obtener datos básicos del psicólogo"""
        psychologist = obj.psychologist
        return {
            'id': psychologist.id,
            'user_id': psychologist.user.id,
            'name': psychologist.user.get_full_name(),
            'email': psychologist.user.email,
            'phone': psychologist.phone,
            'professional_title': psychologist.professional_title,
            'profile_image': psychologist.profile_image.url if psychologist.profile_image else None
        }
    
    def get_payment_verified_by_name(self, obj):
        """Obtener el nombre de quien verificó el pago"""
        if obj.payment_verified_by:
            return obj.payment_verified_by.get_full_name()
        return None

# Add the AppointmentCreateSerializer
class AppointmentCreateSerializer(serializers.ModelSerializer):
    payment_method = serializers.CharField(required=False, write_only=True)
    
    class Meta:
        model = Appointment
        fields = ('psychologist', 'date', 'start_time', 'end_time', 'client_notes', 'payment_method')
    
    def validate(self, data):
        """
        Validate that the appointment time is available for the psychologist.
        """
        psychologist = data.get('psychologist')
        date = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        # Asegurarse de que estamos usando la fecha correcta para la validación
        # sin conversión de zona horaria
        
        # Check if the psychologist has this time slot in their schedule
        day_of_week = date.strftime('%A').upper()
        schedule_exists = psychologist.schedules.filter(
            day_of_week=day_of_week,
            start_time__lte=start_time,
            end_time__gte=end_time
        ).exists()
        
        if not schedule_exists:
            raise serializers.ValidationError(
                "El psicólogo no tiene disponibilidad en este horario."
            )
        
        # Check if the psychologist already has an appointment at this time
        # Usamos la fecha exacta que viene del frontend
        appointment_exists = Appointment.objects.filter(
            psychologist=psychologist,
            date=date,
            start_time__lt=end_time,
            end_time__gt=start_time,
            status__in=['PAYMENT_VERIFIED', 'CONFIRMED', 'PAYMENT_UPLOADED']
        ).exists()
        
        if appointment_exists:
            raise serializers.ValidationError(
                "El psicólogo ya tiene una cita agendada en este horario."
            )
        
        return data