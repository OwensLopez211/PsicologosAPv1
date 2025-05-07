import os
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from ..models import AdminProfile, PsychologistProfile
from ..serializers import AdminProfileSerializer, UserBasicSerializer
from ..permissions import IsAdminUser, IsAdminOrClient

# Obtener el modelo de usuario
User = get_user_model()

# Agregar esta clase con el endpoint para las estadísticas
class AdminStatisticsView(APIView):
    """API endpoint para obtener estadísticas del panel de administración"""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Obtener estadísticas para el dashboard del administrador"""
        try:
            # Importar modelos necesarios
            from ..models import ClientProfile, PsychologistProfile, AdminProfile
            from django.db.models import Count
            
            # Análisis detallado de cada usuario
            print("\n[DEBUG] ======= ANÁLISIS DETALLADO DE USUARIOS Y PERFILES =======")
            all_users = User.objects.all()
            
            psychologist_ids = [] # IDs de usuarios que son psicólogos
            client_ids = []       # IDs de usuarios que son clientes
            
            for user in all_users:
                # Verificar si tienen perfiles asociados
                has_psychologist_profile = PsychologistProfile.objects.filter(user=user).exists()
                has_client_profile = ClientProfile.objects.filter(user=user).exists()
                has_admin_profile = AdminProfile.objects.filter(user=user).exists()
                
                print(f"[DEBUG] Usuario ID: {user.id}, Email: {user.email}, Tipo: {user.user_type}")
                print(f"[DEBUG]   - Perfiles: Psicólogo: {has_psychologist_profile}, Cliente: {has_client_profile}, Admin: {has_admin_profile}")
                
                # Recolectar IDs de psicólogos y clientes para el conteo
                if user.user_type == 'psychologist' and has_psychologist_profile and user.is_active:
                    psychologist_ids.append(user.id)
                elif user.user_type == 'client' and has_client_profile and user.is_active:
                    client_ids.append(user.id)
            
            print("[DEBUG] =========================================================\n")
            
            # Conteo final
            print(f"[DEBUG] Conteo final de perfiles verificados:")
            print(f"[DEBUG] - Total clientes con perfil: {len(client_ids)}")
            print(f"[DEBUG] - Total psicólogos con perfil: {len(psychologist_ids)}")
            
            # Obtener estados de verificación
            psychologist_profiles = PsychologistProfile.objects.filter(user_id__in=psychologist_ids)
            verified_count = psychologist_profiles.filter(verification_status='VERIFIED').count()
            pending_count = psychologist_profiles.filter(
                verification_status__in=['PENDING', 'DOCUMENTS_SUBMITTED', 'VERIFICATION_IN_PROGRESS']
            ).count()
            rejected_count = psychologist_profiles.filter(verification_status='REJECTED').count()
            
            print(f"[DEBUG] Estados de verificación de psicólogos:")
            print(f"[DEBUG] - Verificados: {verified_count}")
            print(f"[DEBUG] - Pendientes: {pending_count}")
            print(f"[DEBUG] - Rechazados: {rejected_count}")
            print(f"[DEBUG] - Total: {verified_count + pending_count + rejected_count} (debe coincidir con {len(psychologist_ids)})")
            
            # Total de usuarios (suma de clientes y psicólogos con perfil)
            total_active_users = len(client_ids) + len(psychologist_ids)
            
            # Total de clientes
            client_count = len(client_ids)
            
            # Stats para el frontend
            stats = {
                'totalUsers': total_active_users,
                'verifiedUsers': verified_count,
                'pendingUsers': pending_count, 
                'rejectedUsers': rejected_count,
                'clientUsers': client_count  # Añadir conteo de clientes
            }
            
            print(f"[DEBUG] Estadísticas finales: {stats}")
            
            return Response(stats)
            
        except Exception as e:
            import traceback
            print(f"[ERROR] Error al obtener estadísticas: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {"detail": f"Error al obtener estadísticas: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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