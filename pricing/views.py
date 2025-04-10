from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import PriceConfiguration, PsychologistPrice, PriceChangeRequest, PromotionalDiscount
from .serializers import (
    PriceConfigurationSerializer, 
    PsychologistPriceSerializer, 
    PriceChangeRequestSerializer,
    PromotionalDiscountSerializer
)
from profiles.models import PsychologistProfile
from authentication.permissions import IsAdminUser, IsPsychologist

class PriceConfigurationViewSet(viewsets.ModelViewSet):
    """API endpoint for price configuration"""
    queryset = PriceConfiguration.objects.all().order_by('-updated_at')
    serializer_class = PriceConfigurationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def current(self, request):
        """Get the current price configuration"""
        try:
            config = PriceConfiguration.objects.latest('updated_at')
            serializer = self.get_serializer(config)
            return Response(serializer.data)
        except PriceConfiguration.DoesNotExist:
            return Response(
                {"detail": "No hay configuración de precios disponible."},
                status=status.HTTP_404_NOT_FOUND
            )

class PsychologistPriceViewSet(viewsets.ModelViewSet):
    """API endpoint for psychologist prices"""
    serializer_class = PsychologistPriceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['psychologist__user__first_name', 'psychologist__user__last_name', 'psychologist__user__email']
    ordering_fields = ['price', 'created_at', 'updated_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'admin':
            return PsychologistPrice.objects.all()
        elif user.user_type == 'psychologist':
            try:
                psychologist = PsychologistProfile.objects.get(user=user)
                return PsychologistPrice.objects.filter(psychologist=psychologist)
            except PsychologistProfile.DoesNotExist:
                return PsychologistPrice.objects.none()
        return PsychologistPrice.objects.none()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated, IsAdminUser]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsPsychologist])
    def my_price(self, request):
        """Get the price for the authenticated psychologist"""
        user = request.user
        
        try:
            psychologist = PsychologistProfile.objects.get(user=user)
            price = PsychologistPrice.objects.filter(psychologist=psychologist).first()
            
            if price:
                serializer = self.get_serializer(price)
                return Response(serializer.data)
            else:
                return Response(
                    {"detail": "No tiene un precio asignado aún."},
                    status=status.HTTP_404_NOT_FOUND
                )
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": "No se encontró el perfil de psicólogo."},
                status=status.HTTP_404_NOT_FOUND
            )

class PriceChangeRequestViewSet(viewsets.ModelViewSet):
    """API endpoint for price change requests"""
    serializer_class = PriceChangeRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['psychologist__user__first_name', 'psychologist__user__last_name', 'psychologist__user__email']
    ordering_fields = ['current_price', 'requested_price', 'status', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'admin':
            return PriceChangeRequest.objects.all()
        elif user.user_type == 'psychologist':
            try:
                psychologist = PsychologistProfile.objects.get(user=user)
                return PriceChangeRequest.objects.filter(psychologist=psychologist)
            except PsychologistProfile.DoesNotExist:
                return PriceChangeRequest.objects.none()
        return PriceChangeRequest.objects.none()
    
    def perform_create(self, serializer):
        user = self.request.user
        
        if user.user_type == 'psychologist':
            try:
                psychologist = PsychologistProfile.objects.get(user=user)
                
                # Get current price
                current_price = PsychologistPrice.objects.filter(psychologist=psychologist).first()
                
                if current_price:
                    serializer.save(
                        psychologist=psychologist,
                        current_price=current_price.price
                    )
                else:
                    # If no price is assigned yet, use the suggested price or 0
                    current_price_value = psychologist.suggested_price or 0
                    serializer.save(
                        psychologist=psychologist,
                        current_price=current_price_value
                    )
            except PsychologistProfile.DoesNotExist:
                raise serializers.ValidationError("No se encontró el perfil de psicólogo.")
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminUser])
    def approve(self, request, pk=None):
        """Approve a price change request"""
        price_request = self.get_object()
        
        if price_request.status != 'pending':
            return Response(
                {"detail": "Esta solicitud ya ha sido procesada."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the request status
        price_request.status = 'approved'
        price_request.admin_notes = request.data.get('admin_notes', '')
        price_request.save()
        
        # Update or create the psychologist price
        price, created = PsychologistPrice.objects.update_or_create(
            psychologist=price_request.psychologist,
            defaults={
                'price': price_request.requested_price,
                'is_approved': True,
                'admin_notes': request.data.get('admin_notes', '')
            }
        )
        
        serializer = self.get_serializer(price_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminUser])
    def reject(self, request, pk=None):
        """Reject a price change request"""
        price_request = self.get_object()
        
        if price_request.status != 'pending':
            return Response(
                {"detail": "Esta solicitud ya ha sido procesada."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the request status
        price_request.status = 'rejected'
        price_request.admin_notes = request.data.get('admin_notes', '')
        price_request.save()
        
        serializer = self.get_serializer(price_request)
        return Response(serializer.data)

class PromotionalDiscountViewSet(viewsets.ModelViewSet):
    """API endpoint for promotional discounts"""
    queryset = PromotionalDiscount.objects.all()
    serializer_class = PromotionalDiscountSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'discount_percentage', 'start_date', 'end_date', 'is_active']
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def active(self, request):
        """Get all active promotional discounts"""
        from django.utils import timezone
        now = timezone.now()
        
        discounts = PromotionalDiscount.objects.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now
        )
        
        serializer = self.get_serializer(discounts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def validate_code(self, request, pk=None):
        """Validate a promotional discount code"""
        code = request.data.get('code')
        
        if not code:
            return Response(
                {"detail": "Se requiere un código promocional."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            discount = PromotionalDiscount.objects.get(code=code, is_active=True)
            
            if discount.is_valid():
                serializer = self.get_serializer(discount)
                return Response(serializer.data)
            else:
                return Response(
                    {"detail": "El código promocional ha expirado o alcanzado su límite de usos."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except PromotionalDiscount.DoesNotExist:
            return Response(
                {"detail": "Código promocional inválido."},
                status=status.HTTP_404_NOT_FOUND
            )
