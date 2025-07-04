import os
import mimetypes
from django.http import HttpResponse, Http404
from django.conf import settings
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny  # Add this import
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from backend.email_utils import send_verification_status_email

from ..models import PsychologistProfile, ProfessionalDocument, ProfessionalExperience

from ..serializers import (
    PsychologistProfileSerializer, PsychologistProfileBasicSerializer,
    ProfessionalDocumentSerializer, UserBasicSerializer, ProfessionalExperienceSerializer
)
from ..permissions import IsProfileOwner, IsAdminUser

class PublicPsychologistListView(generics.ListAPIView):
    """API endpoint para listar psicólogos públicamente"""
    serializer_class = PsychologistProfileBasicSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        # Solo mostrar psicólogos verificados
        queryset = PsychologistProfile.objects.filter(verification_status='VERIFIED')
        
        # Filtrar por especialidad si se proporciona
        specialty = self.request.query_params.get('specialty', None)
        if specialty:
            queryset = queryset.filter(specialties__contains=[specialty])
        
        # Filtrar por población objetivo si se proporciona
        population = self.request.query_params.get('population', None)
        if population:
            queryset = queryset.filter(target_populations__contains=[population])
        
        # Filtrar por región si se proporciona
        region = self.request.query_params.get('region', None)
        if region:
            queryset = queryset.filter(region__icontains=region)
        
        # Filtrar por ciudad si se proporciona
        city = self.request.query_params.get('city', None)
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        # Filtrar por nombre si se proporciona
        name = self.request.query_params.get('name', None)
        if name:
            queryset = queryset.filter(user__first_name__icontains=name) | queryset.filter(user__last_name__icontains=name)
        
        return queryset


class PsychologistDetailView(generics.RetrieveAPIView):
    """API endpoint para ver detalles de un psicólogo públicamente"""
    serializer_class = PsychologistProfileSerializer
    permission_classes = [permissions.AllowAny]
    queryset = PsychologistProfile.objects.filter(verification_status='VERIFIED')
    
    def get_object(self):
        """
        Override to allow lookup by either profile ID or user ID
        """
        pk = self.kwargs.get('pk')
        
        # First try to find by profile ID
        try:
            return PsychologistProfile.objects.get(id=pk, verification_status='VERIFIED')
        except PsychologistProfile.DoesNotExist:
            # If not found, try to find by user ID
            try:
                return PsychologistProfile.objects.get(user_id=pk, verification_status='VERIFIED')
            except PsychologistProfile.DoesNotExist:
                raise Http404("No se encontró el perfil del psicólogo")
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Get the presentation video document if it exists
        presentation_video = ProfessionalDocument.objects.filter(
            psychologist=instance,
            document_type='presentation_video',
            verification_status__in=['verified', 'approved']
        ).first()
        
        # Add verification documents to the response
        documents = ProfessionalDocument.objects.filter(
            psychologist=instance,
            verification_status__in=['verified', 'approved']
        )
        document_serializer = ProfessionalDocumentSerializer(documents, many=True)
        data['verification_documents'] = document_serializer.data
        
        # Add presentation video URL specifically
        if presentation_video:
            data['presentation_video_url'] = presentation_video.file.url if presentation_video.file else None
            print(f"Found presentation video: {data['presentation_video_url']}")
        else:
            data['presentation_video_url'] = None
            print("No presentation video found for psychologist", instance.id)
            
        return Response(data)


class PsychologistProfileViewSet(viewsets.ModelViewSet):
    """API endpoint para perfil de psicólogo"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PsychologistProfileBasicSerializer
        return PsychologistProfileSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'admin':
            return PsychologistProfile.objects.all()
        elif user.user_type == 'client':
            # Los clientes solo pueden ver psicólogos verificados
            return PsychologistProfile.objects.filter(verification_status='VERIFIED')
        return PsychologistProfile.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    # Añadir estos métodos para la gestión de psicólogos desde el panel de administrador
    @action(detail=False, methods=['get'])
    def admin_list(self, request):
        """Endpoint para que los administradores vean todos los perfiles de psicólogos"""
        user = self.request.user
        if user.user_type != 'admin':
            return Response(
                {"detail": "Este endpoint es solo para administradores."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            # Información de depuración
            print(f"[DEBUG] Request: {request.method} {request.path}")
            print(f"[DEBUG] Query params: {request.query_params}")
            
            # Obtener todos los perfiles de psicólogos con datos de usuario relacionados
            # Usamos una lista en lugar de queryset para evitar problemas con la evaluación tardía
            profiles = list(PsychologistProfile.objects.filter(
                user__user_type='psychologist'
            ).select_related('user').order_by('-created_at'))
            
            print(f"[DEBUG] Perfiles encontrados inicialmente: {len(profiles)}")
            
            # Filtrar por estado de verificación si se proporciona
            verification_status = request.query_params.get('verification_status', None)
            if verification_status:
                print(f"[DEBUG] Filtrando por estado: {verification_status}")
                # Obtener los valores válidos del modelo
                valid_statuses = [choice[0] for choice in PsychologistProfile._meta.get_field('verification_status').choices]
                print(f"[DEBUG] Estados válidos: {valid_statuses}")
                
                # Filtrar solo si el estado es válido
                if verification_status in valid_statuses:
                    profiles = [p for p in profiles if p.verification_status == verification_status]
                    print(f"[DEBUG] Perfiles después de filtrar por {verification_status}: {len(profiles)}")
                else:
                    print(f"[DEBUG] Estado de verificación no válido: {verification_status}")
            
            # Limitar resultados si se solicita
            limit_param = request.query_params.get('limit', None)
            if limit_param:
                try:
                    limit = int(limit_param)
                    print(f"[DEBUG] Limitando a {limit} perfiles")
                    profiles = profiles[:limit]
                except ValueError:
                    print(f"[DEBUG] Parámetro limit no válido: {limit_param}")
            
            # Serializar la lista de perfiles
            serializer = self.get_serializer(profiles, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            import traceback
            print(f"[ERROR] Error en admin_list: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {"detail": f"Error al obtener listado de psicólogos: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def admin_detail(self, request, pk=None):
        """Endpoint para que los administradores vean un perfil de psicólogo específico"""
        user = self.request.user
        if user.user_type != 'admin':
            return Response(
                {"detail": "Este endpoint es solo para administradores."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Try to find the profile by ID first
        try:
            profile = PsychologistProfile.objects.get(id=pk)
        except PsychologistProfile.DoesNotExist:
            # If not found, try to find by user ID
            try:
                profile = PsychologistProfile.objects.get(user__id=pk)
            except PsychologistProfile.DoesNotExist:
                return Response(
                    {"detail": f"No se encontró ningún perfil de psicólogo con ID {pk}"},
                    status=status.HTTP_404_NOT_FOUND
                )
                
        # Get the profile data
        profile_serializer = self.get_serializer(profile)
        
        # Get the verification documents
        documents = ProfessionalDocument.objects.filter(psychologist=profile)
        document_serializer = ProfessionalDocumentSerializer(documents, many=True)
        
        # Return both profile and documents data
        response_data = profile_serializer.data
        response_data['verification_documents'] = document_serializer.data
        
        return Response(response_data)
    
    @action(detail=True, methods=['patch'])
    def update_verification_status(self, request, pk=None):
        """
        Endpoint para que los administradores actualicen el estado de verificación de un psicólogo
        """
        user = self.request.user
        if user.user_type != 'admin':
            return Response(
                {"detail": "Este endpoint es solo para administradores."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Obtener el perfil del psicólogo
        try:
            profile = PsychologistProfile.objects.get(id=pk)
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": f"No se encontró ningún perfil de psicólogo con ID {pk}"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validar el nuevo estado
        new_status = request.data.get('verification_status')
        valid_statuses = [status[0] for status in PsychologistProfile._meta.get_field('verification_status').choices]
        
        if not new_status or new_status not in valid_statuses:
            return Response(
                {"detail": f"Estado de verificación inválido. Opciones válidas: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Si está cambiando a REJECTED, verificar si se proporciona un motivo
        if new_status == 'REJECTED' and 'rejection_reason' not in request.data:
            return Response(
                {"detail": "Se requiere un motivo de rechazo cuando el estado es REJECTED."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Guardar el estado anterior para verificar si cambió
        previous_status = profile.verification_status
        
        # Actualizar el estado de verificación
        profile.verification_status = new_status
        
        # Si se proporciona un motivo de rechazo, guardarlo
        if new_status == 'REJECTED' and 'rejection_reason' in request.data:
            profile.rejection_reason = request.data.get('rejection_reason')
        
        profile.save()
        
        # Si el estado cambió, enviar notificación por correo
        if previous_status != new_status:
            try:
                send_verification_status_email(profile)
                print(f"Correo de actualización de estado enviado a {profile.user.email}")
            except Exception as e:
                print(f"Error al enviar correo de actualización de estado: {str(e)}")
        
        # Devolver el perfil actualizado
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def admin_verification_documents(self, request, pk=None):
        """Endpoint para que los administradores vean los documentos de verificación de un psicólogo"""
        user = self.request.user
        if user.user_type != 'admin':
            return Response(
                {"detail": "Este endpoint es solo para administradores."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = self.get_object()
        documents = ProfessionalDocument.objects.filter(psychologist=profile)
        serializer = ProfessionalDocumentSerializer(documents, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def upload_document(self, request, pk=None):
        """Endpoint para subir documentos profesionales"""
        profile = self.get_object()
        
        # Verificar permiso
        if request.user != profile.user and request.user.user_type != 'admin':
            return Response(
                {"detail": "No tienes permiso para subir documentos a este perfil."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ProfessionalDocumentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(psychologist=profile)
            
            # Si es el primer documento, actualizar estado de verificación
            if profile.verification_status == 'PENDING':
                profile.verification_status = 'DOCUMENTS_SUBMITTED'
                profile.save()
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get', 'patch', 'put'])
    def me(self, request):
        """Endpoint para obtener o actualizar el perfil del psicólogo autenticado"""
        user = self.request.user
        if user.user_type != 'psychologist':
            return Response(
                {"detail": "Este endpoint es solo para psicólogos."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = PsychologistProfile.objects.get(user=user)
        
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        
        # Para PATCH o PUT
        # Extract user data from request
        user_data = {}
        profile_data = request.data.copy()
        
        # Log para depuración - Ver todos los datos recibidos
        print("DEBUG - Datos recibidos para actualizar:", profile_data)
        print("DEBUG - Valor de gender recibido:", profile_data.get('gender', 'No hay valor de gender en la solicitud'))
        
        # Remove profile_image from regular update if it's present but not a file
        if 'profile_image' in profile_data and not hasattr(profile_data['profile_image'], 'read'):
            profile_data.pop('profile_image')
        
        # Move user-related fields to user_data
        for field in ['first_name', 'last_name']:
            if field in profile_data:
                user_data[field] = profile_data.pop(field)
        
        # Log the data being processed
        print("User data to update:", user_data)
        print("Profile data to update:", profile_data)
        
        # Update user if needed
        if user_data:
            user_serializer = UserBasicSerializer(user, data=user_data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
            else:
                return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Asegurarse de que el campo gender se procese correctamente
        if 'gender' in profile_data:
            print("DEBUG - Procesando campo gender:", profile_data['gender'])
            
        # Update profile
        serializer = self.get_serializer(profile, data=profile_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            print("DEBUG - Perfil actualizado correctamente con gender:", profile.gender)
            
            # Return the complete updated profile
            updated_serializer = self.get_serializer(profile)
            return Response(updated_serializer.data)
        else:
            print("DEBUG - Errores al validar el perfil:", serializer.errors)
            if 'gender' in serializer.errors:
                print("DEBUG - Error específico en gender:", serializer.errors['gender'])
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def upload_image(self, request):
        """Endpoint para subir imagen de perfil"""
        user = self.request.user
        if user.user_type != 'psychologist':
            return Response(
                {"detail": "Este endpoint es solo para psicólogos."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = PsychologistProfile.objects.get(user=user)
        
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
        """Endpoint para eliminar la imagen de perfil del psicólogo"""
        user = self.request.user
        if user.user_type != 'psychologist':
            return Response(
                {"detail": "Este endpoint es solo para psicólogos."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = PsychologistProfile.objects.get(user=user)
        
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

    @action(detail=False, methods=['get'])
    def documents(self, request):
        """Endpoint para obtener los documentos de verificación del psicólogo autenticado"""
        user = self.request.user
        if user.user_type != 'psychologist':
            return Response(
                {"detail": "Este endpoint es solo para psicólogos."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = PsychologistProfile.objects.get(user=user)
        documents = ProfessionalDocument.objects.filter(psychologist=profile)
        serializer = ProfessionalDocumentSerializer(documents, many=True)
        return Response(serializer.data)
    
    # Alias for verification_documents
    @action(detail=False, methods=['get'])
    def verification_documents(self, request):
        """Alias para el endpoint documents"""
        return self.documents(request)
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_document(self, request):
        """Endpoint para subir un documento de verificación"""
        user = self.request.user
        if user.user_type != 'psychologist':
            return Response(
                {"detail": "Este endpoint es solo para psicólogos."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = PsychologistProfile.objects.get(user=user)
        
        # Validate required fields
        if 'document_type' not in request.data:
            return Response(
                {"detail": "El tipo de documento es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if 'file' not in request.FILES:
            return Response(
                {"detail": "El archivo es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        document_type = request.data.get('document_type')
        
        # Check if document already exists
        try:
            document = ProfessionalDocument.objects.get(
                psychologist=profile,
                document_type=document_type
            )
            
            # Delete the old file from storage before updating
            if document.file:
                # Get the old file path
                old_file_path = document.file.path
                
                # Check if the file exists
                if os.path.isfile(old_file_path):
                    try:
                        os.remove(old_file_path)
                        print(f"Deleted old document file: {old_file_path}")
                    except (OSError, FileNotFoundError) as e:
                        # Log the error but continue with the upload
                        print(f"Error deleting previous document file: {e}")
            
            # Update existing document
            document.file = request.FILES['file']
            document.description = request.data.get('description', '')
            document.verification_status = 'pending'  # Reset verification status
            document.is_verified = False
            document.rejection_reason = None
            document.save()
            
            serializer = ProfessionalDocumentSerializer(document)
            return Response(serializer.data)
            
        except ProfessionalDocument.DoesNotExist:
            # Create new document
            document = ProfessionalDocument(
                psychologist=profile,
                document_type=document_type,
                file=request.FILES['file'],
                description=request.data.get('description', ''),
                verification_status='pending'
            )
            document.save()
            
            # Update psychologist verification status if needed
            if profile.verification_status == 'PENDING':
                profile.verification_status = 'DOCUMENTS_SUBMITTED'
                profile.save()
            
            serializer = ProfessionalDocumentSerializer(document)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # Alias for upload_verification_document
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_verification_document(self, request):
        """Alias para el endpoint upload_document"""
        return self.upload_document(request)
    
    @action(detail=False, methods=['delete'])
    def delete_document(self, request):
        """Endpoint para eliminar un documento de verificación"""
        user = self.request.user
        if user.user_type != 'psychologist':
            return Response(
                {"detail": "Este endpoint es solo para psicólogos."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = PsychologistProfile.objects.get(user=user)
        
        # Validate document_type parameter
        document_type = request.query_params.get('document_type')
        if not document_type:
            return Response(
                {"detail": "El parámetro 'document_type' es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find and delete the document
        try:
            document = ProfessionalDocument.objects.get(
                psychologist=profile,
                document_type=document_type
            )
            document.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProfessionalDocument.DoesNotExist:
            return Response(
                {"detail": "Documento no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    # Alias for delete_verification_document
    @action(detail=False, methods=['delete'])
    def delete_verification_document(self, request):
        """Alias para el endpoint delete_document"""
        return self.delete_document(request)

    @action(detail=False, methods=['patch'])
    def update_bank_info(self, request):
        """Endpoint para actualizar información bancaria del psicólogo"""
        user = self.request.user
        if user.user_type != 'psychologist':
            return Response(
                {"detail": "Este endpoint es solo para psicólogos."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = PsychologistProfile.objects.get(user=user)
        
        # Campos permitidos para actualización bancaria
        allowed_fields = [
            'bank_account_number', 'bank_account_type', 'bank_account_owner', 
            'bank_account_owner_rut', 'bank_account_owner_email', 'bank_name'
        ]
        
        # Filtrar solo los campos permitidos
        bank_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        serializer = self.get_serializer(profile, data=bank_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'], url_path='documents/download/(?P<document_id>[^/.]+)')
    def download_document(self, request, document_id=None, *args, **kwargs):
        """Endpoint para descargar un documento específico"""
        try:
            document = ProfessionalDocument.objects.get(id=document_id)
        except ProfessionalDocument.DoesNotExist:
            return Response(
                {"detail": "Documento no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Get the file path
        file_path = document.file.path
        
        if not os.path.exists(file_path):
            return Response(
                {"detail": "El archivo no existe."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Determine content type based on file extension
        content_type, encoding = mimetypes.guess_type(file_path)
        if not content_type:
            content_type = 'application/octet-stream'
            
        # Get the original filename
        filename = os.path.basename(file_path)
        
        # Open the file
        with open(file_path, 'rb') as file:
            response = HttpResponse(file.read(), content_type=content_type)
            
        # Set content disposition to force download
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
    
    @action(detail=True, methods=['patch'], url_path='documents/(?P<document_id>[^/.]+)/verify')
    def verify_document(self, request, pk=None, document_id=None):
        """Endpoint para verificar un documento específico"""
        user = self.request.user
        if user.user_type != 'admin':
            return Response(
                {"detail": "Este endpoint es solo para administradores."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            document = ProfessionalDocument.objects.get(id=document_id)
        except ProfessionalDocument.DoesNotExist:
            return Response(
                {"detail": "Documento no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Usamos el estado 'approved' en lugar de 'verified'
        document.verification_status = 'approved'
        document.is_verified = True
        document.rejection_reason = None
        document.save()
        
        # Removed: Code that was checking if all documents are verified and updating psychologist status
        
        serializer = ProfessionalDocumentSerializer(document)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'], url_path='documents/(?P<document_id>[^/.]+)/reject')
    def reject_document(self, request, pk=None, document_id=None):
        """Endpoint para rechazar un documento específico"""
        user = self.request.user
        if user.user_type != 'admin':
            return Response(
                {"detail": "Este endpoint es solo para administradores."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            document = ProfessionalDocument.objects.get(id=document_id)
        except ProfessionalDocument.DoesNotExist:
            return Response(
                {"detail": "Documento no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Verificar que se proporciona un motivo de rechazo
        if 'rejection_reason' not in request.data:
            return Response(
                {"detail": "Se requiere el campo 'rejection_reason'."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        document.verification_status = 'rejected'
        document.is_verified = False
        document.rejection_reason = request.data['rejection_reason']
        document.save()
        
        # Removed: Code that was updating psychologist status
        
        serializer = ProfessionalDocumentSerializer(document)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'], url_path='admin/psychologists/documents/(?P<document_id>[^/.]+)/status')
    def update_document_status(self, request, document_id=None):
        """Actualiza el estado de verificación de un documento específico.
        No afecta al estado de verificación del perfil del psicólogo.
        """
        user = self.request.user
        if user.user_type != 'admin':
            return Response(
                {"detail": "Este endpoint es solo para administradores."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            document = ProfessionalDocument.objects.get(id=document_id)
        except ProfessionalDocument.DoesNotExist:
            return Response(
                {"detail": f"No se encontró ningún documento con ID {document_id}"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Verificar que se proporciona un nuevo estado
        if 'verification_status' not in request.data:
            return Response(
                {"detail": "Se requiere el campo 'verification_status'."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        new_status = request.data['verification_status']
        
        # Obtener los estados válidos directamente del modelo
        valid_statuses_tuples = ProfessionalDocument._meta.get_field('verification_status').choices
        valid_statuses = [status_value for status_value, _ in valid_statuses_tuples]
        
        print(f"Estado solicitado: {new_status}")
        print(f"Estados válidos para documentos: {valid_statuses}")
        
        # Convertir 'VERIFIED' a 'approved' para manejar la inconsistencia
        if new_status == 'VERIFIED':
            new_status = 'approved'
        
        if new_status not in valid_statuses:
            return Response(
                {"detail": f"Estado de verificación no válido. Debe ser uno de: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        document.verification_status = new_status
        
        # Si se rechaza, guardar el motivo
        if new_status == 'rejected' and 'rejection_reason' in request.data:
            document.rejection_reason = request.data['rejection_reason']
        elif new_status == 'approved':
            document.is_verified = True
            document.rejection_reason = None
        
        document.save()
        
        # Return the updated document
        serializer = ProfessionalDocumentSerializer(document)
        return Response(serializer.data)

    # In the PsychologistProfileViewSet class
    def get_by_user_id(self, request, user_id=None):
        """
        Get a psychologist profile by user ID
        """
        try:
            profile = PsychologistProfile.objects.get(user_id=user_id)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": f"Psychologist with user ID {user_id} does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def experiences(self, request):
        """Obtener todas las experiencias profesionales del psicólogo"""
        psychologist = self.get_object_from_request(request)
        experiences = ProfessionalExperience.objects.filter(psychologist=psychologist)
        serializer = ProfessionalExperienceSerializer(experiences, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_experiences(self, request):
        """Actualizar experiencias profesionales del psicólogo"""
        psychologist = self.get_object_from_request(request)
        
        # Obtener las experiencias del request
        experiences_data = request.data.get('experiences', [])
        
        # Validar que sea una lista
        if not isinstance(experiences_data, list):
            return Response(
                {"error": "El formato de experiencias debe ser una lista"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Primero eliminamos las experiencias existentes si las hubiera para evitar duplicados
        ProfessionalExperience.objects.filter(psychologist=psychologist).delete()
        
        # Crear nuevas experiencias
        created_experiences = []
        for exp_data in experiences_data:
            # Crear la experiencia con la instancia del psicólogo, no su ID
            serializer = ProfessionalExperienceSerializer(data=exp_data)
            if serializer.is_valid():
                # Guardar pero no llamar a save() todavía
                experience = serializer.save(psychologist=psychologist)
                created_experiences.append(serializer.data)
            else:
                # Si hay un error, revertir y devolver error
                return Response(
                    {"error": "Error al guardar experiencia", "details": serializer.errors}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(
            {"message": "Experiencias actualizadas correctamente", "experiences": created_experiences},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['delete'], url_path='experiences/(?P<experience_id>[^/.]+)')
    def delete_experience(self, request, experience_id=None):
        """Eliminar una experiencia profesional específica"""
        psychologist = self.get_object_from_request(request)
        
        try:
            experience = ProfessionalExperience.objects.get(
                id=experience_id, 
                psychologist=psychologist
            )
            experience.delete()
            return Response(
                {"message": "Experiencia eliminada correctamente"},
                status=status.HTTP_200_OK
            )
        except ProfessionalExperience.DoesNotExist:
            return Response(
                {"error": "La experiencia no existe o no pertenece a este psicólogo"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['put'], url_path='experiences/(?P<experience_id>[^/.]+)')
    def update_experience(self, request, experience_id=None):
        """Actualizar una experiencia profesional específica"""
        psychologist = self.get_object_from_request(request)
        
        try:
            experience = ProfessionalExperience.objects.get(
                id=experience_id, 
                psychologist=psychologist
            )
            
            # Actualizar los datos de la experiencia
            serializer = ProfessionalExperienceSerializer(
                experience, 
                data=request.data, 
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Error al actualizar experiencia", "details": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ProfessionalExperience.DoesNotExist:
            return Response(
                {"error": "La experiencia no existe o no pertenece a este psicólogo"},
                status=status.HTTP_404_NOT_FOUND
            )

    # Función de ayuda para obtener el perfil del psicólogo
    def get_object_from_request(self, request):
        """Helper para obtener el perfil del psicólogo desde el request"""
        user = request.user
        try:
            return PsychologistProfile.objects.get(user=user)
        except PsychologistProfile.DoesNotExist:
            raise Http404("No existe un perfil de psicólogo para este usuario")

    @action(detail=True, methods=['patch'])
    def toggle_verification_status(self, request, pk=None):
        """
        Endpoint para que los administradores actualicen el estado de verificación de un psicólogo
        """
        user = self.request.user
        if user.user_type != 'admin':
            return Response(
                {"detail": "Este endpoint es solo para administradores."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Obtener el perfil del psicólogo
        try:
            profile = PsychologistProfile.objects.get(id=pk)
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": f"No se encontró ningún perfil de psicólogo con ID {pk}"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validar el nuevo estado
        new_status = request.data.get('verification_status')
        valid_statuses = [status[0] for status in PsychologistProfile._meta.get_field('verification_status').choices]
        
        if not new_status or new_status not in valid_statuses:
            return Response(
                {"detail": f"Estado de verificación inválido. Opciones válidas: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Si está cambiando a REJECTED, verificar si se proporciona un motivo
        if new_status == 'REJECTED' and 'rejection_reason' not in request.data:
            return Response(
                {"detail": "Se requiere un motivo de rechazo cuando el estado es REJECTED."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Guardar el estado anterior para verificar si cambió
        previous_status = profile.verification_status
        
        # Actualizar el estado de verificación
        profile.verification_status = new_status
        
        # Si se proporciona un motivo de rechazo, guardarlo
        if new_status == 'REJECTED' and 'rejection_reason' in request.data:
            profile.rejection_reason = request.data.get('rejection_reason')
        
        profile.save()
        
        # Si el estado cambió, enviar notificación por correo
        if previous_status != new_status:
            try:
                send_verification_status_email(profile)
                print(f"Correo de actualización de estado enviado a {profile.user.email}")
            except Exception as e:
                print(f"Error al enviar correo de actualización de estado: {str(e)}")
        
        # Devolver el perfil actualizado
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_verification_status(self, request):
        """Devuelve el estado de verificación del psicólogo autenticado"""
        user = request.user
        if user.user_type != 'psychologist':
            return Response({"detail": "Solo para psicólogos."}, status=403)
        try:
            profile = PsychologistProfile.objects.get(user=user)
            return Response({
                "verification_status": profile.verification_status,
                "verification_status_display": profile.get_verification_status_display()
            })
        except PsychologistProfile.DoesNotExist:
            return Response({"detail": "No se encontró el perfil de psicólogo."}, status=404)


    