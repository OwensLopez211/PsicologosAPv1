import os
import requests
from django.template.loader import render_to_string
from django.conf import settings
from datetime import datetime

# Configura las credenciales
MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY")
MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "no-reply@emindapp.cl")

def send_email(to_email, subject, template_name=None, context=None, template_content=None, is_html_template=False):
    """
    Envía un correo electrónico usando la API de Mailgun
    
    Args:
        to_email (str): Email del destinatario
        subject (str): Asunto del correo
        template_name (str, optional): Nombre de la plantilla HTML
        context (dict, optional): Contexto para renderizar la plantilla
        template_content (str, optional): Contenido HTML directo para el correo
        is_html_template (bool, optional): Indica si el template_content es HTML
    """
    # Renderiza el HTML usando la plantilla y el contexto o usa el contenido proporcionado
    if template_name and context:
        html_content = render_to_string(template_name, context)
    elif template_content and is_html_template:
        html_content = template_content
    elif template_content:
        # Si hay contenido pero no es HTML, asumimos que es texto plano
        # y lo envolvemos en un HTML simple
        html_content = f"<html><body>{template_content}</body></html>"
    else:
        print("❌ Error: Debe proporcionar una plantilla y contexto, o el contenido directo")
        return False
    
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

def send_password_reset_email(user, token, base_url):
    """
    Envía un correo con instrucciones para restablecer la contraseña
    
    Args:
        user: Instancia del modelo User
        token: Token de restablecimiento generado
        base_url: URL base para construir el enlace de restablecimiento
    """
    # Preparar el enlace de restablecimiento
    reset_url = f"{base_url}/auth/reset-password/?token={token}&email={user.email}"
    
    # Preparar el contexto para la plantilla
    context = {
        'nombre': f"{user.first_name} {user.last_name}" if user.first_name else user.email,
        'token': token,
        'reset_url': reset_url
    }
    
    # Definir asunto y plantilla
    subject = 'Restablece tu contraseña en E-Mind'
    template_name = 'emails/reset_password.html'
    
    # Enviar el correo
    return send_email(user.email, subject, template_name, context)

def send_appointment_created_client_email(appointment, payment_info=None):
    """
    Envía correo al cliente cuando agenda una nueva cita, incluyendo las instrucciones de pago
    
    Args:
        appointment: Instancia del modelo Appointment
        payment_info: Diccionario con información de pago (opcional)
    """
    client = appointment.client
    user = client.user
    psychologist = appointment.psychologist
    
    # Configurar información de pago por defecto si no se proporciona
    if not payment_info:
        payment_info = {
            'nombre_destinatario': 'E-Mind SpA',
            'rut_destinatario': '77.777.777-7',
            'banco_destinatario': 'Banco Estado',
            'tipo_cuenta': 'Cuenta Corriente',
            'numero_cuenta': '12345678',
            'correo_destinatario': 'pagos@emindapp.cl'
        }
    
    # Formatear la fecha y horas para presentación
    fecha_cita = appointment.date.strftime('%d/%m/%Y')
    hora_inicio = appointment.start_time.strftime('%H:%M')
    hora_fin = appointment.end_time.strftime('%H:%M')
    
    # Preparar el contexto para la plantilla
    context = {
        'nombre_paciente': f"{user.first_name} {user.last_name}",
        'nombre_psicologo': f"{psychologist.user.first_name} {psychologist.user.last_name}",
        'fecha_cita': fecha_cita,
        'hora_inicio': hora_inicio,
        'hora_fin': hora_fin,
        'monto_pago': appointment.payment_amount,
        'nombre_destinatario': payment_info['nombre_destinatario'],
        'rut_destinatario': payment_info['rut_destinatario'],
        'banco_destinatario': payment_info['banco_destinatario'],
        'tipo_cuenta': payment_info['tipo_cuenta'],
        'numero_cuenta': payment_info['numero_cuenta'],
        'correo_destinatario': payment_info['correo_destinatario']
    }
    
    # Definir asunto y plantilla
    subject = f'Cita agendada para el {fecha_cita} - Pendiente de pago'
    template_name = 'emails/cita_agendada_paciente.html'
    
    # Enviar el correo
    return send_email(user.email, subject, template_name, context)

def send_appointment_created_psychologist_email(appointment, is_first_appointment=None):
    """
    Envía correo al psicólogo cuando le agendan una nueva cita
    
    Args:
        appointment: Instancia del modelo Appointment
        is_first_appointment: Booleano indicando si es primera cita (opcional, se calcula si es None)
    """
    psychologist = appointment.psychologist
    user_psy = psychologist.user
    client = appointment.client
    
    # Determinar si es primera cita si no se especifica
    if is_first_appointment is None:
        # Verificar si hay citas previas entre este cliente y psicólogo
        from appointments.models import Appointment as AppointmentModel
        previous_appointments = AppointmentModel.objects.filter(
            client=client,
            psychologist=psychologist
        ).exclude(pk=appointment.pk).exists()
        
        is_first_appointment = not previous_appointments
    
    # Formatear la fecha y horas para presentación
    fecha_cita = appointment.date.strftime('%d/%m/%Y')
    hora_inicio = appointment.start_time.strftime('%H:%M')
    hora_fin = appointment.end_time.strftime('%H:%M')
    
    # Preparar el contexto para la plantilla
    context = {
        'nombre_psicologo': f"{user_psy.first_name} {user_psy.last_name}",
        'nombre_paciente': f"{client.user.first_name} {client.user.last_name}",
        'fecha_cita': fecha_cita,
        'hora_inicio': hora_inicio,
        'hora_fin': hora_fin,
        'es_primera_cita': is_first_appointment
    }
    
    # Definir asunto y plantilla
    subject = f'Nueva cita agendada para el {fecha_cita}'
    template_name = 'emails/cita_agendada_psicologo.html'
    
    # Enviar el correo
    return send_email(user_psy.email, subject, template_name, context)

def send_payment_verification_needed_email(appointment, frontend_url=None):
    """
    Envía correo al psicólogo cuando un paciente sube el comprobante de pago y está pendiente de verificación
    
    Args:
        appointment: Instancia del modelo Appointment
        frontend_url: URL base del frontend (opcional)
    """
    psychologist = appointment.psychologist
    user_psy = psychologist.user
    client = appointment.client
    
    # Generar URL del panel si se proporciona la URL del frontend
    url_panel = f"{frontend_url}/psicologo/pagos-pendientes" if frontend_url else "#"
    
    # Formatear la fecha y horas para presentación
    fecha_cita = appointment.date.strftime('%d/%m/%Y')
    hora_inicio = appointment.start_time.strftime('%H:%M')
    hora_fin = appointment.end_time.strftime('%H:%M')
    
    # Preparar el contexto para la plantilla
    context = {
        'nombre_psicologo': f"{user_psy.first_name} {user_psy.last_name}",
        'nombre_paciente': f"{client.user.first_name} {client.user.last_name}",
        'fecha_cita': fecha_cita,
        'hora_inicio': hora_inicio,
        'hora_fin': hora_fin,
        'monto_pago': appointment.payment_amount,
        'url_panel': url_panel
    }
    
    # Definir asunto y plantilla
    subject = f'Pago pendiente de verificación - Cita del {fecha_cita}'
    template_name = 'emails/pago_pendiente_verificacion.html'
    
    # Enviar el correo
    return send_email(user_psy.email, subject, template_name, context)