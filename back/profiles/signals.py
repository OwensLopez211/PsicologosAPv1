from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import ClientProfile, PsychologistProfile, ProfessionalDocument, AdminProfile
from django.db import transaction

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
            # Crear nuevo perfil de cliente con el mismo ID que el usuario
            with transaction.atomic():
                profile = ClientProfile(user=instance, id=instance.id, **profile_data)
                profile.save()
        else:
            # Actualizar perfil existente si hay datos
            if profile_data and hasattr(instance, 'clientprofile_profile'):
                for key, value in profile_data.items():
                    setattr(instance.clientprofile_profile, key, value)
                instance.clientprofile_profile.save()
                
    elif instance.user_type == 'psychologist':
        if created:
            # Crear nuevo perfil de psicólogo con el mismo ID que el usuario
            with transaction.atomic():
                # Asegurarnos de que hay un valor para experience_description si existe en la tabla
                # pero no en el modelo (debido a una migración incompleta)
                if 'experience_description' not in profile_data:
                    try:
                        # Intentar crear con un valor por defecto para experience_description
                        profile = PsychologistProfile(
                            user=instance, 
                            id=instance.id, 
                            experience_description="", 
                            **profile_data
                        )
                        profile.save()
                    except TypeError:
                        # Si el modelo no tiene el campo experience_description, 
                        # crear sin ese campo
                        profile = PsychologistProfile(
                            user=instance, 
                            id=instance.id, 
                            **profile_data
                        )
                        profile.save()
                else:
                    profile = PsychologistProfile(user=instance, id=instance.id, **profile_data)
                    profile.save()
        else:
            # Actualizar perfil existente si hay datos
            if profile_data and hasattr(instance, 'psychologistprofile_profile'):
                for key, value in profile_data.items():
                    setattr(instance.psychologistprofile_profile, key, value)
                instance.psychologistprofile_profile.save()
    
    elif instance.user_type == 'admin':
        if created:
            # Crear nuevo perfil de administrador con el mismo ID que el usuario
            with transaction.atomic():
                profile = AdminProfile(user=instance, id=instance.id, **profile_data)
                profile.save()
        else:
            # Actualizar perfil existente si hay datos
            if profile_data and hasattr(instance, 'adminprofile_profile'):
                for key, value in profile_data.items():
                    setattr(instance.adminprofile_profile, key, value)
                instance.adminprofile_profile.save()

