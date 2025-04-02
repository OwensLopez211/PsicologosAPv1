from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404  # Add this import
from .models import ClientProfile, PsychologistProfile, ProfessionalDocument, Schedule
from .serializers import (
    ClientProfileSerializer, PsychologistProfileSerializer,
    PsychologistProfileBasicSerializer, ProfessionalDocumentSerializer,
    ScheduleSerializer, UserBasicSerializer, AdminProfileSerializer  # Add AdminProfileSerializer here
)
from .permissions import IsProfileOwner, IsAdminUser, IsPsychologist, IsClient

class ClientProfileViewSet(viewsets.ModelViewSet):
    """API endpoint para perfil de cliente"""
    serializer_class = ClientProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsProfileOwner | IsAdminUser]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'admin':
            return ClientProfile.objects.all()
        return ClientProfile.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    # In the ClientProfileViewSet class, update the 'me' action
    
    @action(detail=False, methods=['get', 'patch', 'put'])
    def me(self, request):
        """Endpoint para obtener o actualizar el perfil del usuario autenticado"""
        user = self.request.user
        if user.user_type != 'client':
            return Response(
                {"detail": "Este endpoint es solo para clientes."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = ClientProfile.objects.get(user=user)
        
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        
        # Para PATCH o PUT
        # Extract user data from request
        user_data = {}
        profile_data = request.data.copy()
        
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
        
        # Update profile
        serializer = self.get_serializer(profile, data=profile_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Return the complete updated profile
            updated_serializer = self.get_serializer(profile)
            return Response(updated_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def upload_image(self, request):
        """Endpoint para subir imagen de perfil para clientes"""
        user = self.request.user
        if user.user_type != 'client':
            return Response(
                {"detail": "Este endpoint es solo para clientes."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = ClientProfile.objects.get(user=user)
        
        if 'profile_image' not in request.FILES:
            return Response(
                {"detail": "No se ha proporcionado ninguna imagen."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete previous image if it exists
        if profile.profile_image:
            import os
            from django.conf import settings
            
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
        """Endpoint para eliminar la imagen de perfil del cliente"""
        user = self.request.user
        if user.user_type != 'client':
            return Response(
                {"detail": "Este endpoint es solo para clientes."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = ClientProfile.objects.get(user=user)
        
        # Check if profile has an image
        if not profile.profile_image:
            return Response(
                {"detail": "No hay imagen de perfil para eliminar."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete the image file from storage
        import os
        from django.conf import settings
        
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
    def admin_list(self, request):
        """Endpoint para que los administradores vean todos los perfiles de clientes"""
        user = self.request.user
        if user.user_type != 'admin':
            return Response(
                {"detail": "Este endpoint es solo para administradores."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Get all client profiles with related user data
        profiles = ClientProfile.objects.all().select_related('user')
        serializer = self.get_serializer(profiles, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def admin_detail(self, request, pk=None):
        """Endpoint para que los administradores vean un perfil de cliente específico"""
        user = self.request.user
        if user.user_type != 'admin':
            return Response(
                {"detail": "Este endpoint es solo para administradores."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    

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
        """Endpoint para obtener o actualizar el psicólogo autenticado"""
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
        
        # Handle graduation_year specifically
        if 'graduation_year' in profile_data:
            try:
                if profile_data['graduation_year'] == '' or profile_data['graduation_year'] is None:
                    profile_data['graduation_year'] = None
                else:
                    profile_data['graduation_year'] = int(profile_data['graduation_year'])
            except (ValueError, TypeError):
                return Response(
                    {"graduation_year": ["Introduzca un número entero válido."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
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
        
        # Return detailed validation errors
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
            import os
            from django.conf import settings
            
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
        import os
        from django.conf import settings
        
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
    def update_schedule(self, request):
        """Endpoint para actualizar el horario del psicólogo autenticado"""
        user = self.request.user
        if user.user_type != 'psychologist':
            return Response(
                {"detail": "Este endpoint es solo para psicólogos."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = PsychologistProfile.objects.get(user=user)
        
        # Obtener o crear el horario del psicólogo
        schedule, created = Schedule.objects.get_or_create(psychologist=profile)
        
        # Agregar logging para ver qué datos están llegando
        print("Request data:", request.data)
        
        # Actualizar el horario con los datos recibidos
        if 'schedule' in request.data:
            # Asegurarse de que los datos no estén vacíos
            if request.data['schedule']:
                schedule.schedule_config = request.data['schedule']
                schedule.save()
                
                # Log para depuración
                print(f"Schedule updated for psychologist {profile.id}: {schedule.schedule_config}")
                
                # Return the schedule data directly with the correct field name
                return Response({
                    "id": schedule.id,
                    "schedule_config": schedule.schedule_config,
                    "psychologist": profile.id
                })
            else:
                return Response(
                    {"detail": "Los datos de horario están vacíos."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(
            {"detail": "No se proporcionaron datos de horario."},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    @action(detail=False, methods=['get'])
    def schedule(self, request):
        """Endpoint para obtener el horario del psicólogo autenticado"""
        user = self.request.user
        if user.user_type != 'psychologist':
            return Response(
                {"detail": "Este endpoint es solo para psicólogos."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = PsychologistProfile.objects.get(user=user)
        
        try:
            schedule = Schedule.objects.get(psychologist=profile)
            return Response({
                "id": schedule.id,
                "schedule_config": schedule.schedule_config,
                "psychologist": profile.id
            })
        except Schedule.DoesNotExist:
            return Response({
                "id": None,
                "schedule_config": {},
                "psychologist": profile.id
            })

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
                import os
                from django.conf import settings
                
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


class PublicPsychologistListView(generics.ListAPIView):
    """API endpoint para listar psicólogos públicamente"""
    serializer_class = PsychologistProfileBasicSerializer
    permission_classes = []  # Acceso público
    
    def get_queryset(self):
        # Solo mostrar psicólogos verificados
        return PsychologistProfile.objects.filter(verification_status='VERIFIED')

class PsychologistDetailView(generics.RetrieveAPIView):
    """API endpoint para ver detalles de un psicólogo públicamente"""
    serializer_class = PsychologistProfileSerializer
    permission_classes = []  # Acceso público
    
    def get_queryset(self):
        # Solo mostrar psicólogos verificados
        return PsychologistProfile.objects.filter(verification_status='VERIFIED')
    
    def get_object(self):
        pk = self.kwargs['pk']
        # Try to find by profile ID first
        try:
            return self.get_queryset().get(id=pk)
        except PsychologistProfile.DoesNotExist:
            # If not found, try to find by user ID
            try:
                return self.get_queryset().get(user__id=pk)
            except PsychologistProfile.DoesNotExist:
                # If still not found, raise 404
                from django.http import Http404
                raise Http404(f"No PsychologistProfile found with ID {pk}")
    
    @action(detail=False, methods=['patch'])
    def update_professional_info(self, request):
        """Endpoint para actualizar información profesional del psicólogo"""
        user = self.request.user
        if user.user_type != 'psychologist':
            return Response(
                {"detail": "Este endpoint es solo para psicólogos."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = PsychologistProfile.objects.get(user=user)
        
        # Campos permitidos para actualización profesional
        allowed_fields = [
            'professional_title', 'specialties', 'health_register_number', 
            'university', 'graduation_year', 'experience_description', 
            'target_populations', 'intervention_areas'
        ]
        
        # Filtrar solo los campos permitidos
        professional_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        serializer = self.get_serializer(profile, data=professional_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminProfileViewSet(viewsets.ModelViewSet):
    """API endpoint para perfil de administrador"""
    serializer_class = AdminProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'admin':
            return ClientProfile.objects.filter(user=user)
        return ClientProfile.objects.none()
    
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
            
        # Obtener o crear el perfil del administrador
        profile, created = ClientProfile.objects.get_or_create(user=user)
        
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        
        # Para PATCH o PUT
        # Extract user data from request
        user_data = {}
        profile_data = request.data.copy()
        
        # Remove profile_image from regular update if it's present but not a file
        if 'profile_image' in profile_data and not hasattr(profile_data['profile_image'], 'read'):
            profile_data.pop('profile_image')
        
        # Move user-related fields to user_data
        for field in ['first_name', 'last_name']:
            if field in profile_data:
                user_data[field] = profile_data.pop(field)
        
        # Log the data being processed
        print("Admin user data to update:", user_data)
        print("Admin profile data to update:", profile_data)
        
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
        
        # Return detailed validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def upload_image(self, request):
        """Endpoint para subir imagen de perfil para administradores"""
        user = self.request.user
        if user.user_type != 'admin':
            return Response(
                {"detail": "Este endpoint es solo para administradores."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile, created = ClientProfile.objects.get_or_create(user=user)
        
        if 'profile_image' not in request.FILES:
            return Response(
                {"detail": "No se ha proporcionado ninguna imagen."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete previous image if it exists
        if profile.profile_image:
            import os
            from django.conf import settings
            
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
            
        profile, created = ClientProfile.objects.get_or_create(user=user)
        
        # Check if profile has an image
        if not profile.profile_image:
            return Response(
                {"detail": "No hay imagen de perfil para eliminar."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete the image file from storage
        import os
        from django.conf import settings
        
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
    
    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        """Endpoint para que los administradores activen/desactiven un perfil de cliente"""
        user = self.request.user
        if user.user_type != 'admin':
            return Response(
                {"detail": "Este endpoint es solo para administradores."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        profile = self.get_object()
        client_user = profile.user
        
        # Toggle the is_active status
        client_user.is_active = not client_user.is_active
        client_user.save()
        
        serializer = self.get_serializer(profile)
        return Response({
            "detail": f"Usuario {'activado' if client_user.is_active else 'desactivado'} exitosamente",
            "profile": serializer.data
        })

    
    