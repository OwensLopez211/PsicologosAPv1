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
                try:
                    # Intentar crear el perfil
                    # Primero, limpiar datos que no existen en el modelo
                    filtered_profile_data = {}
                    for key, value in profile_data.items():
                        if key != 'experience_description':
                            filtered_profile_data[key] = value
                    
                    # Crear el perfil con los datos filtrados
                    profile = PsychologistProfile(
                        user=instance, 
                        id=instance.id, 
                        **filtered_profile_data
                    )
                    
                    # Intentar añadir experience_description a la conexión SQL directamente si es necesario
                    # Esto se hace de esta manera porque el modelo no tiene el campo pero la base de datos sí
                    profile.save()
                    
                    # Si la tabla en la base de datos tiene la columna experience_description,
                    # realizar una actualización directa con SQL
                    try:
                        from django.db import connection
                        with connection.cursor() as cursor:
                            cursor.execute(
                                "UPDATE profiles_psychologistprofile SET experience_description = %s WHERE id = %s",
                                ["", profile.id]
                            )
                    except Exception as e:
                        print(f"Error al actualizar experience_description: {e}")
                        
                except Exception as e:
                    print(f"Error al crear perfil de psicólogo: {e}")
                    # Reintento sin experience_description
                    profile = PsychologistProfile(
                        user=instance, 
                        id=instance.id, 
                        **filtered_profile_data
                    )
                    profile.save()
        else:
            # Actualizar perfil existente si hay datos
            if profile_data and hasattr(instance, 'psychologistprofile_profile'):
                # Filtrar los datos para eliminar experience_description
                filtered_profile_data = {}
                for key, value in profile_data.items():
                    if key != 'experience_description':
                        filtered_profile_data[key] = value
                
                # Actualizar con los datos filtrados
                for key, value in filtered_profile_data.items():
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

