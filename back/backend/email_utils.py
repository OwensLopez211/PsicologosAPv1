import os
import requests
from django.template.loader import render_to_string
from django.conf import settings

# Configura las credenciales
MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY")
MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "no-reply@emindapp.cl")

def send_email(to_email, subject, template_name, context):
    """
    Envía un correo electrónico usando la API de Mailgun
    
    Args:
        to_email (str): Email del destinatario
        subject (str): Asunto del correo
        template_name (str): Nombre de la plantilla HTML
        context (dict): Contexto para renderizar la plantilla
    """
    # Renderiza el HTML usando la plantilla y el contexto
    html_content = render_to_string(template_name, context)
    
    # URL de la API de Mailgun
    url = f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages"
    
    # Prepara los datos del mensaje
    data = {
        "from": f"E-Mind <{DEFAULT_FROM_EMAIL}>",
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }
    
    # Imprimir lo que se va a enviar (para debug)
    print(f"\n===== ENVIANDO CORREO REAL =====")
    print(f"Para: {to_email}")
    print(f"Asunto: {subject}")
    print(f"Dominio Mailgun: {MAILGUN_DOMAIN}")
    print(f"API Key presente: {'Sí' if MAILGUN_API_KEY else 'No'}")
    print(f"===========================\n")
    
    # Envía el mensaje usando la API de Mailgun
    try:
        response = requests.post(
            url,
            auth=("api", MAILGUN_API_KEY),
            data=data
        )
        
        # Verifica la respuesta
        if response.status_code == 200:
            print(f"✅ Correo enviado correctamente a {to_email} vía Mailgun API")
            return True
        else:
            print(f"❌ Fallo al enviar correo a {to_email}: {response.status_code} {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error al enviar correo a {to_email}: {str(e)}")
        return False

def send_welcome_email(user):
    """
    Envía un correo de bienvenida según el tipo de usuario
    
    Args:
        user: Instancia del modelo User
    """
    context = {
        'nombre': f"{user.first_name} {user.last_name}" if user.first_name else user.email
    }
    
    if user.user_type == 'client':
        template_name = 'emails/bienvenida_paciente.html'
        subject = '¡Bienvenido a E-Mind!'
    elif user.user_type == 'psychologist':
        template_name = 'emails/bienvenida_psicologo.html'
        subject = 'Bienvenido a E-Mind - Revisaremos tu perfil'
    else:
        # No enviamos correo para administradores
        return False
    
    return send_email(user.email, subject, template_name, context)

def send_verification_status_email(psychologist_profile):
    """
    Envía un correo notificando cambios en el estado de verificación del psicólogo
    
    Args:
        psychologist_profile: Instancia del modelo PsychologistProfile
    """
    user = psychologist_profile.user
    status = psychologist_profile.verification_status
    
    # Prepara el contexto para la plantilla
    context = {
        'nombre': f"{user.first_name} {user.last_name}" if user.first_name else user.email,
        'estado': status,
        'motivo': getattr(psychologist_profile, 'rejection_reason', 'No especificado')
    }
    
    # Determina el asunto según el estado
    if status == 'VERIFIED':
        subject = '¡Tu perfil ha sido verificado en E-Mind!'
    elif status == 'REJECTED':
        subject = 'Información sobre tu solicitud en E-Mind'
    else:
        subject = 'Actualización del estado de tu perfil en E-Mind'
    
    # Envía el correo
    return send_email(
        user.email,
        subject,
        'emails/verificacion_psicologo.html',
        context
    )