from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PaymentDetail
from .serializers import PaymentDetailSerializer
from appointments.models import Appointment

class PaymentDetailViewSet(viewsets.ModelViewSet):
    queryset = PaymentDetail.objects.all()
    serializer_class = PaymentDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def create_with_appointment(self, request):
        """Create a payment detail with appointment information"""
        appointment_id = request.data.get('appointment_id')
        payment_method = request.data.get('payment_method')
        
        if not appointment_id or not payment_method:
            return Response(
                {"detail": "Se requiere appointment_id y payment_method"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            
            # Check if the appointment belongs to the current user
            if request.user.user_type == 'client' and appointment.client.user != request.user:
                return Response(
                    {"detail": "No tiene permiso para crear un pago para esta cita"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Create payment detail
            payment_detail = PaymentDetail.objects.create(
                appointment=appointment,
                payment_method=payment_method
            )
            
            return Response(
                PaymentDetailSerializer(payment_detail).data,
                status=status.HTTP_201_CREATED
            )
            
        except Appointment.DoesNotExist:
            return Response(
                {"detail": "Cita no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )
