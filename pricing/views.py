from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from profiles.models import PsychologistProfile
from profiles.permissions import IsAdminUser
from .models import PriceConfiguration, PsychologistPrice, SuggestedPrice, PriceChangeRequest
from .serializers import (
    PriceConfigurationSerializer, 
    PsychologistPriceSerializer, 
    SuggestedPriceSerializer,
    PriceChangeRequestSerializer
)

class PriceConfigurationViewSet(viewsets.ModelViewSet):
    """API endpoint for price configurations"""
    queryset = PriceConfiguration.objects.all()
    serializer_class = PriceConfigurationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get the current active price configuration"""
        config = PriceConfiguration.objects.filter(is_active=True).first()
        if not config:
            config = PriceConfiguration.objects.create()  # Create default if none exists
        
        serializer = self.get_serializer(config)
        return Response(serializer.data)


class PsychologistPriceViewSet(viewsets.ModelViewSet):
    """API endpoint for psychologist prices"""
    queryset = PsychologistPrice.objects.all()
    serializer_class = PsychologistPriceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'admin':
            return PsychologistPrice.objects.all()
        elif user.user_type == 'psychologist':
            try:
                profile = PsychologistProfile.objects.get(user=user)
                return PsychologistPrice.objects.filter(psychologist=profile)
            except PsychologistProfile.DoesNotExist:
                return PsychologistPrice.objects.none()
        return PsychologistPrice.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_price(self, request):
        """Get the approved price for the authenticated psychologist"""
        user = request.user
        if user.user_type != 'psychologist':
            return Response(
                {"detail": "Solo los psicólogos pueden acceder a este endpoint."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            profile = PsychologistProfile.objects.get(user=user)
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": "Perfil de psicólogo no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get the current approved price
        approved_price = PsychologistPrice.objects.filter(
            psychologist=profile, 
            is_approved=True
        ).first()
        
        if not approved_price:
            return Response(
                {"detail": "No price has been set for this psychologist."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(approved_price)
        return Response(serializer.data)
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def my_price(self, request):
        """Get the price for the current psychologist"""
        if request.user.user_type != 'psychologist':
            return Response(
                {"detail": "Only psychologists can access this endpoint."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            profile = PsychologistProfile.objects.get(user=request.user)
            price = PsychologistPrice.objects.get(psychologist=profile)
            serializer = self.get_serializer(price)
            return Response(serializer.data)
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": "Psychologist profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except PsychologistPrice.DoesNotExist:
            return Response(
                {"detail": "No price has been set for this psychologist."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], url_path='psychologist/(?P<psychologist_id>[^/.]+)')
    def get_psychologist_price(self, request, psychologist_id=None):
        """Get the price for a specific psychologist by ID"""
        try:
            # Convert to integer
            psychologist_id = int(psychologist_id)
            
            # First try to find by profile ID
            try:
                psychologist = PsychologistProfile.objects.get(id=psychologist_id)
            except PsychologistProfile.DoesNotExist:
                # If not found, try to find by user ID
                psychologist = PsychologistProfile.objects.get(user_id=psychologist_id)
            
            # Get the latest approved price
            price = PsychologistPrice.objects.filter(
                psychologist=psychologist,
                is_approved=True
            ).order_by('-created_at').first()
            
            if not price:
                return Response({"price": None}, status=status.HTTP_200_OK)
            
            return Response({"price": price.price}, status=status.HTTP_200_OK)
            
        except ValueError:
            return Response(
                {"detail": "Invalid psychologist ID format."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": f"No PsychologistProfile found with ID {psychologist_id}."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # In PsychologistPriceViewSet class
    
    # Change this action to make it more explicit
    @action(detail=False, methods=['post'], url_path='set_psychologist_price/(?P<psychologist_id>[^/.]+)')
    def set_psychologist_price(self, request, psychologist_id=None):
        """Set the price for a specific psychologist by ID"""
        # Only admin can set prices
        if request.user.user_type != 'admin':
            return Response(
                {"detail": "Only admins can set psychologist prices."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Convert to integer
            psychologist_id = int(psychologist_id)
            
            # First try to find by profile ID
            try:
                psychologist = PsychologistProfile.objects.get(id=psychologist_id)
            except PsychologistProfile.DoesNotExist:
                # If not found, try to find by user ID
                psychologist = PsychologistProfile.objects.get(user_id=psychologist_id)
            
            # Get price from request
            price_data = request.data.get('price')
            if price_data is None:
                return Response(
                    {"detail": "Price is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                price_value = int(price_data)
            except (ValueError, TypeError):
                return Response(
                    {"detail": "Price must be a valid integer."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create or update the price
            price, created = PsychologistPrice.objects.update_or_create(
                psychologist=psychologist,
                is_approved=True,
                defaults={'price': price_value}
            )
            
            # Set all other prices for this psychologist to not approved
            PsychologistPrice.objects.filter(
                psychologist=psychologist
            ).exclude(id=price.id).update(is_approved=False)
            
            return Response({"price": price.price}, status=status.HTTP_200_OK)
            
        except ValueError:
            return Response(
                {"detail": "Invalid psychologist ID format."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": f"No PsychologistProfile found with ID {psychologist_id}."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SuggestedPriceViewSet(viewsets.ModelViewSet):
    """API endpoint for suggested prices"""
    queryset = SuggestedPrice.objects.all()
    serializer_class = SuggestedPriceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'admin':
            return SuggestedPrice.objects.all()
        elif user.user_type == 'psychologist':
            try:
                profile = PsychologistProfile.objects.get(user=user)
                return SuggestedPrice.objects.filter(psychologist=profile)
            except PsychologistProfile.DoesNotExist:
                return SuggestedPrice.objects.none()
        return SuggestedPrice.objects.none()
    
    @action(detail=False, methods=['get', 'post'])
    def my_suggestion(self, request):
        """Get or create the suggested price for the authenticated psychologist"""
        user = request.user
        if user.user_type != 'psychologist':
            return Response(
                {"detail": "Solo los psicólogos pueden acceder a este endpoint."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener el user_id del request o usar el del usuario autenticado
        user_id = request.data.get('user_id', user.id)
        
        try:
            # Buscar el perfil usando el user_id
            profile = PsychologistProfile.objects.get(user_id=user_id)
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": f"Perfil de psicólogo no encontrado para el usuario {user_id}."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if request.method == 'GET':
            # Get the current suggested price
            suggested_price = SuggestedPrice.objects.filter(psychologist=profile).first()
            if not suggested_price:
                return Response(
                    {"detail": "No se ha establecido un precio sugerido."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = self.get_serializer(suggested_price)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Create or update the suggested price
            price = request.data.get('price')
            if not price:
                return Response(
                    {"detail": "El precio es requerido."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if a suggested price already exists
            suggested_price, created = SuggestedPrice.objects.update_or_create(
                psychologist=profile,
                defaults={
                    'price': price,
                    'user_id': user_id  # Guardar también el user_id
                }
            )
            
            serializer = self.get_serializer(suggested_price)
            status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
            return Response(serializer.data, status=status_code)
    
    @action(detail=False, methods=['get'], url_path='psychologist/(?P<psychologist_id>[^/.]+)')
    def get_psychologist_suggested_price(self, request, psychologist_id=None):
        """Get the suggested price for a specific psychologist by ID"""
        try:
            # Convert to integer
            psychologist_id = int(psychologist_id)
            
            # Primero intentar buscar por user_id
            try:
                profile = PsychologistProfile.objects.get(user_id=psychologist_id)
            except PsychologistProfile.DoesNotExist:
                # Si no se encuentra, intentar buscar por profile_id
                profile = PsychologistProfile.objects.get(id=psychologist_id)
            
            # Get the suggested price
            suggested_price = SuggestedPrice.objects.filter(
                psychologist=profile
            ).first()
            
            if not suggested_price:
                return Response({"price": None}, status=status.HTTP_200_OK)
            
            return Response({"price": suggested_price.price}, status=status.HTTP_200_OK)
            
        except ValueError:
            return Response(
                {"detail": "Invalid psychologist ID format."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": f"No PsychologistProfile found with ID {psychologist_id}."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PriceChangeRequestViewSet(viewsets.ModelViewSet):
    """API endpoint for price change requests"""
    queryset = PriceChangeRequest.objects.all()
    serializer_class = PriceChangeRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Admin can see all, psychologists can only see their own
        if self.request.user.user_type == 'admin':
            return PriceChangeRequest.objects.all().order_by('-created_at')
        
        if self.request.user.user_type == 'psychologist':
            try:
                profile = PsychologistProfile.objects.get(user=self.request.user)
                return PriceChangeRequest.objects.filter(psychologist=profile).order_by('-created_at')
            except PsychologistProfile.DoesNotExist:
                return PriceChangeRequest.objects.none()
        
        return PriceChangeRequest.objects.none()
    
    def create(self, request, *args, **kwargs):
        if request.user.user_type != 'psychologist':
            return Response(
                {"detail": "Only psychologists can create price change requests."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            profile = PsychologistProfile.objects.get(user=request.user)
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": "Psychologist profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if there's already a pending request
        if PriceChangeRequest.objects.filter(psychologist=profile, status='pending').exists():
            return Response(
                {"detail": "You already have a pending price change request."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add the psychologist to the request data
        request.data['psychologist'] = profile.id
        
        # Validate the price
        price_config = PriceConfiguration.objects.filter(is_active=True).first()
        if not price_config:
            price_config = PriceConfiguration.objects.create()
        
        requested_price = request.data.get('requested_price')
        if requested_price is None:
            return Response(
                {"detail": "Requested price is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            requested_price = int(requested_price)
        except (ValueError, TypeError):
            return Response(
                {"detail": "Requested price must be a valid integer."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if requested_price < price_config.min_price or requested_price > price_config.max_price:
            return Response(
                {"detail": f"Price must be between {price_config.min_price} and {price_config.max_price}."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().create(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a price change request"""
        if request.user.user_type != 'admin':
            return Response(
                {"detail": "Only administrators can approve price change requests."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        price_request = self.get_object()
        if price_request.status != 'pending':
            return Response(
                {"detail": "Only pending requests can be approved."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the request status
        price_request.status = 'approved'
        price_request.admin_notes = request.data.get('admin_notes', '')
        price_request.save()
        
        # Update or create the psychologist price
        PsychologistPrice.objects.update_or_create(
            psychologist=price_request.psychologist,
            defaults={
                'price': price_request.requested_price,
                'is_approved': True,
                'admin_notes': request.data.get('admin_notes', '')
            }
        )
        
        serializer = self.get_serializer(price_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a price change request"""
        if request.user.user_type != 'admin':
            return Response(
                {"detail": "Only administrators can reject price change requests."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        price_request = self.get_object()
        if price_request.status != 'pending':
            return Response(
                {"detail": "Only pending requests can be rejected."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the request status
        price_request.status = 'rejected'
        price_request.admin_notes = request.data.get('admin_notes', '')
        price_request.save()
        
        serializer = self.get_serializer(price_request)
        return Response(serializer.data)
