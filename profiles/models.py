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
    
    class Meta:
        abstract = True

class ClientProfile(BaseProfile):
    """
    Perfil para usuarios tipo cliente.
    """
    phone_number = models.CharField(max_length=20, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    
    # Añadir los campos faltantes
    rut = models.CharField(max_length=20, blank=True)
    region = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    
    # Información bancaria
    bank_account_number = models.CharField(max_length=50, blank=True)
    bank_account_type = models.CharField(
        max_length=20,
        choices=[
            ('CORRIENTE', 'Cuenta Corriente'),
            ('AHORRO', 'Cuenta de Ahorro'),
            ('VISTA', 'Cuenta Vista')
        ],
        blank=True
    )
    bank_account_owner = models.CharField(max_length=100, blank=True)
    bank_account_owner_rut = models.CharField(max_length=20, blank=True)
    bank_account_owner_email = models.EmailField(blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"Cliente: {self.user.email}"

class AdminProfile(BaseProfile):
    """
    Perfil para usuarios tipo administrador.
    """
    phone_number = models.CharField(max_length=20, blank=True)
    rut = models.CharField(max_length=20, blank=True)
    region = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    role = models.CharField(max_length=100, blank=True, default="Administrator")
    department = models.CharField(max_length=100, blank=True)

    # Información bancaria
    bank_account_number = models.CharField(max_length=50, blank=True)
    bank_account_type = models.CharField(
        max_length=20,
        choices=[
            ('CORRIENTE', 'Cuenta Corriente'),
            ('AHORRO', 'Cuenta de Ahorro'),
            ('VISTA', 'Cuenta Vista')
        ],
        blank=True
    )
    bank_account_owner = models.CharField(max_length=100, blank=True)
    bank_account_owner_rut = models.CharField(max_length=20, blank=True)
    bank_account_owner_email = models.EmailField(blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"Administrador: {self.user.email}"

class PsychologistProfile(BaseProfile):
    """
    Perfil para usuarios tipo psicólogo.
    """
    # Datos personales
    rut = models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=20, blank=True)
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
    
    # Información bancaria
    bank_account_number = models.CharField(max_length=50, blank=True)
    bank_account_type = models.CharField(
        max_length=20,
        choices=[
            ('CORRIENTE', 'Cuenta Corriente'),
            ('AHORRO', 'Cuenta de Ahorro'),
            ('VISTA', 'Cuenta Vista')
        ],
        blank=True
    )
    bank_account_owner = models.CharField(max_length=100, blank=True)
    bank_account_owner_rut = models.CharField(max_length=20, blank=True)
    bank_account_owner_email = models.EmailField(blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    
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

    def get_session_price(self):
        """
        Returns the approved session price for this psychologist.
        If no approved price exists, returns None.
        """
        try:
            # Get the most recent approved price
            from pricing.models import PsychologistPrice
            approved_price = PsychologistPrice.objects.filter(
                psychologist=self,
                is_approved=True
            ).order_by('-updated_at').first()
            
            if approved_price:
                return approved_price.price
            return None
        except:
            return None

class ProfessionalDocument(models.Model):
    """
    Documentos profesionales para verificación de psicólogos.
    """
    DOCUMENT_TYPES = [
        ('presentation_video', 'Video de presentación'),
        ('registration_certificate', 'Certificado de inscripción en Registro Nacional'),
        ('professional_id', 'Carnet profesional'),
        ('specialty_document', 'Documento de especialidad')
    ]
    
    VERIFICATION_STATUS = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado')
    ]
    
    psychologist = models.ForeignKey(PsychologistProfile, on_delete=models.CASCADE, related_name='verification_documents')
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to='psychologist_documents/')
    description = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS, default='pending')
    rejection_reason = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('psychologist', 'document_type')
        
    def __str__(self):
        return f"{self.get_document_type_display()} - {self.psychologist.user.email}"



