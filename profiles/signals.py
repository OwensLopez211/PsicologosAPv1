from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import ClientProfile, PsychologistProfile, ProfessionalDocument, AdminProfile

User = get_user_model()

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Crea o actualiza un perfil cuando se crea o modifica un usuario.
    Los datos adicionales están disponibles en el objeto instance.profile_data
    que es un diccionario con datos para el perfil.
    """
    profile_data = getattr(instance, 'profile_data', {})
    
    if instance.user_type == 'client':
        if created:
            # Crear nuevo perfil de cliente
            ClientProfile.objects.create(user=instance, **profile_data)
        else:
            # Actualizar perfil existente si hay datos
            if profile_data and hasattr(instance, 'clientprofile_profile'):
                for key, value in profile_data.items():
                    setattr(instance.clientprofile_profile, key, value)
                instance.clientprofile_profile.save()
                
    elif instance.user_type == 'psychologist':
        if created:
            # Crear nuevo perfil de psicólogo
            PsychologistProfile.objects.create(user=instance, **profile_data)
        else:
            # Actualizar perfil existente si hay datos
            if profile_data and hasattr(instance, 'psychologistprofile_profile'):
                for key, value in profile_data.items():
                    setattr(instance.psychologistprofile_profile, key, value)
                instance.psychologistprofile_profile.save()
    
    elif instance.user_type == 'admin':
        if created:
            # Crear nuevo perfil de administrador
            AdminProfile.objects.create(user=instance, **profile_data)
        else:
            # Actualizar perfil existente si hay datos
            if profile_data and hasattr(instance, 'adminprofile_profile'):
                for key, value in profile_data.items():
                    setattr(instance.adminprofile_profile, key, value)
                instance.adminprofile_profile.save()

@receiver(post_save, sender=ProfessionalDocument)
def update_verification_status(sender, instance, created, **kwargs):
    """
    Actualiza el estado de verificación si todos los documentos están verificados.
    """
    if instance.is_verified:
        # Obtener todos los documentos del psicólogo
        all_documents = instance.psychologist.documents.all()
        
        # Si todos están verificados y hay al menos uno
        if all_documents.exists() and all_documents.filter(is_verified=True).count() == all_documents.count():
            # Actualizar estado de verificación del psicólogo
            instance.psychologist.verification_status = 'VERIFIED'
            instance.psychologist.is_verified = True
            instance.psychologist.save()