from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class BaseProfile(models.Model):
    """
    Clase base para perfiles de usuario.
    Implementa el patrón de herencia con clases abstractas.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name="%(class)s_profile"
    )
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

class ClientProfile(BaseProfile):
    """
    Perfil para usuarios tipo cliente.
    """
    phone_number = models.CharField(max_length=20, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"Cliente: {self.user.email}"

class PsychologistProfile(BaseProfile):
    """
    Perfil para usuarios tipo psicólogo.
    """
    # Datos personales
    rut = models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    gender = models.CharField(
        max_length=20, 
        choices=[
            ('MALE', 'Masculino'),
            ('FEMALE', 'Femenino'),
            ('OTHER', 'Otro'),
            ('PREFER_NOT_TO_SAY', 'Prefiero no decirlo')
        ],
        blank=True
    )
    region = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    
    # Información profesional
    professional_title = models.CharField(max_length=100, blank=True)
    specialties = models.JSONField(default=list, blank=True)
    health_register_number = models.CharField(max_length=100, blank=True)
    university = models.CharField(max_length=200, blank=True)
    graduation_year = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1950),
            MaxValueValidator(2100)
        ],
        null=True,
        blank=True
    )
    experience_description = models.TextField(blank=True)
    target_populations = models.JSONField(default=list, blank=True)
    intervention_areas = models.JSONField(default=list, blank=True)
    
    # Estado de verificación
    verification_status = models.CharField(
        max_length=30,  # Aumentamos el valor a 30 para asegurarnos
        choices=[
            ('PENDING', 'Pendiente'),
            ('DOCUMENTS_SUBMITTED', 'Documentos Enviados'),
            ('VERIFICATION_IN_PROGRESS', 'En Verificación'),
            ('VERIFIED', 'Verificado'),
            ('REJECTED', 'Rechazado')
        ],
        default='PENDING'
    )

class ProfessionalDocument(models.Model):
    """
    Documentos profesionales del psicólogo (título, certificaciones, etc.)
    """
    psychologist = models.ForeignKey(
        PsychologistProfile, 
        on_delete=models.CASCADE,
        related_name='documents'
    )
    document_type = models.CharField(
        max_length=50,
        choices=[
            ('DEGREE', 'Título Profesional'),
            ('LICENSE', 'Licencia Profesional'),
            ('CERTIFICATION', 'Certificación'),
            ('SPECIALTY', 'Especialidad'),
            ('OTHER', 'Otro')
        ]
    )
    file = models.FileField(upload_to='psychologist_documents/')
    description = models.CharField(max_length=200, blank=True)
    is_verified = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.get_document_type_display()} - {self.psychologist.user.email}"

class Schedule(models.Model):
    """
    Configuración de horarios disponibles para el psicólogo
    """
    psychologist = models.OneToOneField(
        PsychologistProfile,
        on_delete=models.CASCADE,
        related_name='schedule'
    )
    # Almacenamos la configuración de horario como JSON
    # Estructura: {
    #   "monday": {"enabled": true, "slots": [{"start": "09:00", "end": "10:00"}, ...]},
    #   "tuesday": {"enabled": true, "slots": [...]},
    #   ...
    # }
    schedule_config = models.JSONField(default=dict)
    
    def __str__(self):
        return f"Horario de {self.psychologist.user.email}"