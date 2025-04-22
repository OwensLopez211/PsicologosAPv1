import os
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import AdminProfile
from ..serializers import AdminProfileSerializer, UserBasicSerializer
from ..permissions import IsAdminUser, IsAdminOrClient

class AdminProfileViewSet(viewsets.ModelViewSet):
    """API endpoint para perfil de administrador"""
    serializer_class = AdminProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'admin':
            return AdminProfile.objects.all()
        return AdminProfile.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get', 'patch', 'put'])
    def me(self, request):
        """Endpoint para obtener o actualizar el perfil del administrador autenticado"""
        user = self.request.user
        if user.user_type != 'admin':
            return Response(
                {"detail": "Este endpoint es solo para administradores."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = AdminProfile.objects.get(user=user)
        
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        
        # Para PATCH o PUT
        # Extract user data from request
        user_data = {}
        profile_data = request.data.copy()
        
        # Move user-related fields to user_data
        for field in ['first_name', 'last_name']:
            if field in profile_data:
                user_data[field] = profile_data.pop(field)
        
        # Update user if needed
        if user_data:
            user_serializer = UserBasicSerializer(user, data=user_data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
            else:
                return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Update profile
        serializer = self.get_serializer(profile, data=profile_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Return the complete updated profile
            updated_serializer = self.get_serializer(profile)
            return Response(updated_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def public_bank_info(self, request):
        """Endpoint público para obtener los datos bancarios del administrador (accesible para cualquier usuario autenticado)
        
        Nota: Este endpoint está obsoleto. Usar /api/profiles/bank-info/ en su lugar.
        """
        # Obtener el perfil del administrador (tomamos el primero)
        admin_profile = AdminProfile.objects.first()
        
        if not admin_profile:
            return Response(
                {"detail": "No se encontró ningún perfil de administrador."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Devolver solo la información bancaria
        bank_data = {
            'bank_account_number': admin_profile.bank_account_number,
            'bank_account_type': admin_profile.bank_account_type,
            'bank_account_owner': admin_profile.bank_account_owner,
            'bank_account_owner_rut': admin_profile.bank_account_owner_rut,
            'bank_account_owner_email': admin_profile.bank_account_owner_email,
            'bank_name': admin_profile.bank_name
        }
        
        return Response(bank_data)

    @action(detail=False, methods=['post'])
    def upload_image(self, request):
        """Endpoint para subir imagen de perfil para administradores"""
        user = self.request.user
        if user.user_type != 'admin':
            return Response(
                {"detail": "Este endpoint es solo para administradores."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = AdminProfile.objects.get(user=user)
        
        if 'profile_image' not in request.FILES:
            return Response(
                {"detail": "No se ha proporcionado ninguna imagen."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete previous image if it exists
        if profile.profile_image:
            # Get the old file path
            old_image_path = profile.profile_image.path
            
            # Check if the file exists and is not the default image
            if os.path.isfile(old_image_path) and not old_image_path.endswith('default-profile.png'):
                try:
                    os.remove(old_image_path)
                except (OSError, FileNotFoundError) as e:
                    # Log the error but continue with the upload
                    print(f"Error deleting previous image: {e}")
        
        # Save the new image
        profile.profile_image = request.FILES['profile_image']
        profile.save()
        
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def delete_image(self, request):
        """Endpoint para eliminar la imagen de perfil del administrador"""
        user = self.request.user
        if user.user_type != 'admin':
            return Response(
                {"detail": "Este endpoint es solo para administradores."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = AdminProfile.objects.get(user=user)
        
        # Check if profile has an image
        if not profile.profile_image:
            return Response(
                {"detail": "No hay imagen de perfil para eliminar."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete the image file from storage
        # Get the file path
        image_path = profile.profile_image.path
        
        # Check if the file exists and is not the default image
        if os.path.isfile(image_path) and not image_path.endswith('default-profile.png'):
            try:
                os.remove(image_path)
                print(f"Deleted profile image: {image_path}")
            except (OSError, FileNotFoundError) as e:
                print(f"Error deleting profile image: {e}")
        
        # Set profile_image to None/null
        profile.profile_image = None
        profile.save()
        
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'])
    def update_bank_info(self, request):
        """Endpoint para actualizar información bancaria del administrador"""
        user = self.request.user
        if user.user_type != 'admin':
            return Response(
                {"detail": "Este endpoint es solo para administradores."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile, created = AdminProfile.objects.get_or_create(user=user)
        
        # Extract only bank-related fields
        bank_data = {
            k: v for k, v in request.data.items() 
            if k in ['bank_account_number', 'bank_account_type', 'bank_account_owner',
                    'bank_account_owner_rut', 'bank_account_owner_email', 'bank_name']
        }
        
        # Update profile with bank data
        for key, value in bank_data.items():
            setattr(profile, key, value)
        
        profile.save()
        
        serializer = self.get_serializer(profile)
        return Response(serializer.data)