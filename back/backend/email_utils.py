import os
import requests
import logging
from django.template.loader import render_to_string
from django.conf import settings
from datetime import datetime
import datetime as dt
from appointments.models import Appointment
from profiles.models import AdminProfile
from urllib.parse import quote
import uuid
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.mail import EmailMessage

# Configurar logger
logger = logging.getLogger(__name__)

# Configura las credenciales
MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY")
MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "info@emindapp.cl")

def send_email(to_email, subject, template_name=None, context=None, template_content=None, is_html_template=False, attachments=None):
    """
    Envía un correo electrónico usando la API de Mailgun
    
    Args:
        to_email (str): Email del destinatario
        subject (str): Asunto del correo
        template_name (str, optional): Nombre de la plantilla HTML
        context (dict, optional): Contexto para renderizar la plantilla
        template_content (str, optional): Contenido HTML directo para el correo
        is_html_template (bool, optional): Indica si el template_content es HTML
        attachments: Lista de tuplas (filename, content, content_type) para adjuntos
    """
    # Verificar que tengamos las credenciales necesarias
    if not MAILGUN_API_KEY:
        logger.error("❌ Error: MAILGUN_API_KEY no está configurada")
        return False
        
    if not MAILGUN_DOMAIN:
        logger.error("❌ Error: MAILGUN_DOMAIN no está configurada")
        return False
    
    # Renderiza el HTML usando la plantilla y el contexto o usa el contenido proporcionado
    if template_name and context:
        try:
            html_content = render_to_string(template_name, context)
        except Exception as e:
            logger.error(f"❌ Error al renderizar la plantilla {template_name}: {str(e)}")
            return False
    elif template_content and is_html_template:
        html_content = template_content
    elif template_content:
        # Si hay contenido pero no es HTML, asumimos que es texto plano
        # y lo envolvemos en un HTML simple
        html_content = f"<html><body>{template_content}</body></html>"
    else:
        logger.error("❌ Error: Debe proporcionar una plantilla y contexto, o el contenido directo")
        return False
    
    # URL de la API de Mailgun
    url = f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages"
    
    # Validar el correo destinatario
    if not to_email or '@' not in to_email:
        logger.error(f"❌ Error: Dirección de correo destinatario inválida: {to_email}")
        return False
    
    # Prepara los datos del mensaje
    data = {
        "from": f"E-Mind <{DEFAULT_FROM_EMAIL}>",
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }
    
    # Imprimir lo que se va a enviar (para debug)
    logger.debug(f"\n===== ENVIANDO CORREO REAL =====")
    logger.debug(f"Para: {to_email}")
    logger.debug(f"Asunto: {subject}")
    logger.debug(f"Dominio Mailgun: {MAILGUN_DOMAIN}")
    logger.debug(f"API Key presente: {'Sí' if MAILGUN_API_KEY else 'No'}")
    logger.debug(f"===========================\n")
    
    # Envía el mensaje usando la API de Mailgun
    try:
        response = requests.post(
            url,
            auth=("api", MAILGUN_API_KEY),
            data=data,
            files=attachments,
            timeout=10  # Añadir timeout para evitar que se quede esperando indefinidamente
        )
        
        # Verifica la respuesta
        if response.status_code == 200:
            logger.info(f"✅ Correo enviado correctamente a {to_email} vía Mailgun API")
            return True
        else:
            logger.error(f"❌ Fallo al enviar correo a {to_email}: Código {response.status_code} - {response.text}")
            # Intentar decodificar el mensaje de error para más información
            try:
                error_data = response.json()
                logger.error(f"Detalles del error: {error_data}")
            except:
                pass
            return False
    except requests.exceptions.Timeout:
        logger.error(f"❌ Timeout al enviar correo a {to_email}: La petición a Mailgun tardó demasiado")
        return False
    except requests.exceptions.ConnectionError:
        logger.error(f"❌ Error de conexión al enviar correo a {to_email}: No se pudo conectar con Mailgun")
        return False
    except Exception as e:
        logger.error(f"❌ Error al enviar correo a {to_email}: {str(e)}")
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
    reset_url = f"{base_url}/reset-password/{token}"
    
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
    
    # Determinar si es primera cita o si no tiene citas completadas previas
    previous_appointments = Appointment.objects.filter(
        client=client,
        psychologist=psychologist
    ).exclude(pk=appointment.pk)
    
    is_first_appointment = not previous_appointments.exists()
    
    # Verificar si tiene citas previas completadas con este psicólogo
    has_confirmed_appointments = previous_appointments.filter(status='CONFIRMED').exists()
    
    # Usar datos del admin si es primera cita O si no tiene citas completadas previas
    use_admin_data = is_first_appointment or not has_confirmed_appointments
    
    # Configurar información de pago según las condiciones
    if use_admin_data:
        # Si es primera cita o no tiene citas completadas, usar datos del administrador
        if not payment_info:
            # Obtener el perfil del administrador (tomamos el primero)
            admin_profile = AdminProfile.objects.first()
            
            if admin_profile:
                payment_info = {
                    'nombre_destinatario': admin_profile.bank_account_owner or 'E-Mind SpA',
                    'rut_destinatario': admin_profile.bank_account_owner_rut or '77.777.777-7',
                    'banco_destinatario': admin_profile.bank_name or 'Banco Estado',
                    'tipo_cuenta': admin_profile.bank_account_type or 'Cuenta Corriente',
                    'numero_cuenta': admin_profile.bank_account_number or '12345678',
                    'correo_destinatario': admin_profile.bank_account_owner_email or 'pagos@emindapp.cl'
                }
            else:
                # Si no hay perfil de administrador, usar datos por defecto
                logger.warning("⚠️ No se encontró perfil de administrador, usando datos bancarios por defecto")
                payment_info = {
                    'nombre_destinatario': 'E-Mind SpA',
                    'rut_destinatario': '77.777.777-7',
                    'banco_destinatario': 'Banco Estado',
                    'tipo_cuenta': 'Cuenta Corriente',
                    'numero_cuenta': '12345678',
                    'correo_destinatario': 'pagos@emindapp.cl'
                }
    else:
        # Si tiene citas completadas previas, usar datos del psicólogo
        payment_info = {
            'nombre_destinatario': psychologist.bank_account_owner,
            'rut_destinatario': psychologist.bank_account_owner_rut,
            'banco_destinatario': psychologist.bank_name,
            'tipo_cuenta': psychologist.bank_account_type,
            'numero_cuenta': psychologist.bank_account_number,
            'correo_destinatario': psychologist.bank_account_owner_email
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
    
    # Determinar si es primera cita y/o si hay citas completadas si no se especifica
    if is_first_appointment is None:
        # Verificar si hay citas previas entre este cliente y psicólogo
        from appointments.models import Appointment as AppointmentModel
        previous_appointments = AppointmentModel.objects.filter(
            client=client,
            psychologist=psychologist
        ).exclude(pk=appointment.pk)
        
        is_first_appointment = not previous_appointments.exists()
        # Verificar si hay citas completadas
        has_confirmed_appointments = previous_appointments.filter(status='CONFIRMED').exists()
        
        # Usar lógica de primera cita incluso si no es primera pero no tiene completadas
        should_use_admin_payment = is_first_appointment or not has_confirmed_appointments
    else:
        # Si is_first_appointment ya fue especificado, asumimos que la lógica de citas completadas
        # ya fue considerada en el parámetro
        should_use_admin_payment = is_first_appointment
    
    # Formatear la fecha y horas para presentación
    fecha_cita = appointment.date.strftime('%d/%m/%Y')
    hora_inicio = appointment.start_time.strftime('%H:%M')
    hora_fin = appointment.end_time.strftime('%H:%M')
    
    # Si es primera cita o no hay citas completadas, obtener los datos bancarios del administrador
    if should_use_admin_payment:
        # Obtener el perfil del administrador
        admin_profile = AdminProfile.objects.first()
        
        if admin_profile:
            admin_bank_info = {
                'nombre_destinatario': admin_profile.bank_account_owner or 'E-Mind SpA',
                'rut_destinatario': admin_profile.bank_account_owner_rut or '77.777.777-7',
                'banco_destinatario': admin_profile.bank_name or 'Banco Estado',
                'tipo_cuenta': admin_profile.bank_account_type or 'Cuenta Corriente',
                'numero_cuenta': admin_profile.bank_account_number or '12345678',
                'correo_destinatario': admin_profile.bank_account_owner_email or 'pagos@emindapp.cl'
            }
        else:
            # Si no hay perfil de administrador, usar datos por defecto
            logger.warning("⚠️ No se encontró perfil de administrador, usando datos bancarios por defecto")
            admin_bank_info = {
                'nombre_destinatario': 'E-Mind SpA',
                'rut_destinatario': '77.777.777-7',
                'banco_destinatario': 'Banco Estado',
                'tipo_cuenta': 'Cuenta Corriente',
                'numero_cuenta': '12345678',
                'correo_destinatario': 'pagos@emindapp.cl'
            }
    else:
        admin_bank_info = None
    
    # Preparar el contexto para la plantilla
    context = {
        'nombre_psicologo': f"{user_psy.first_name} {user_psy.last_name}",
        'nombre_paciente': f"{client.user.first_name} {client.user.last_name}",
        'fecha_cita': fecha_cita,
        'hora_inicio': hora_inicio,
        'hora_fin': hora_fin,
        'es_primera_cita': should_use_admin_payment,  # Cambiamos para reflejar la lógica correcta
        'admin_bank_info': admin_bank_info
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

def send_appointment_confirmed_client_email(appointment, frontend_url=None):
    """
    Envía correo al cliente cuando el psicólogo confirma la cita, incluyendo un archivo .ics para agregar a cualquier calendario
    
    Args:
        appointment: Instancia del modelo Appointment
        frontend_url: URL base del frontend (opcional)
    """
    client = appointment.client
    user = client.user
    psychologist = appointment.psychologist
    
    # Formatear la fecha y horas para presentación
    fecha_cita = appointment.date.strftime('%d/%m/%Y')
    hora_inicio = appointment.start_time.strftime('%H:%M')
    hora_fin = appointment.end_time.strftime('%H:%M')
    
    # Generar archivo .ics
    uid = str(uuid.uuid4())
    start_datetime = dt.datetime.combine(appointment.date, appointment.start_time)
    end_datetime = dt.datetime.combine(appointment.date, appointment.end_time)
    
    # Formatear fechas para .ics (formato local, sin UTC)
    # Quitamos el sufijo Z para indicar que es hora local y no UTC
    start_local = start_datetime.strftime('%Y%m%dT%H%M%S')
    end_local = end_datetime.strftime('%Y%m%dT%H%M%S')
    
    # Formatear fechas para Google Calendar (formato ISO)
    # Google Calendar necesita fechas en formato ISO 8601
    start_iso = start_datetime.strftime('%Y%m%dT%H%M%S')
    end_iso = end_datetime.strftime('%Y%m%dT%H%M%S')
    
    # Datos para el evento
    summary = f"Sesión con {psychologist.user.first_name} {psychologist.user.last_name}"
    description = f"Cita de terapia a través de E-Mind con {psychologist.user.first_name} {psychologist.user.last_name}."
    location = "Videollamada"
    
    # Crear enlaces para diferentes calendarios
    # Google Calendar
    google_cal_params = {
        'action': 'TEMPLATE',
        'text': quote(summary),
        'dates': f"{start_iso}/{end_iso}",
        'details': quote(description),
        'location': quote(location),
    }
    google_calendar_url = "https://calendar.google.com/calendar/render?" + "&".join([f"{k}={v}" for k, v in google_cal_params.items()])
    
    # Outlook Web
    outlook_params = {
        'subject': quote(summary),
        'startdt': start_iso,
        'enddt': end_iso,
        'body': quote(description),
        'location': quote(location),
    }
    outlook_calendar_url = "https://outlook.live.com/calendar/0/deeplink/compose?" + "&".join([f"{k}={v}" for k, v in outlook_params.items()])
    
    # Yahoo Calendar 
    yahoo_params = {
        'title': quote(summary),
        'st': start_iso,
        'et': end_iso,
        'desc': quote(description),
        'in_loc': quote(location),
    }
    yahoo_calendar_url = "https://calendar.yahoo.com/?" + "&".join([f"{k}={v}" for k, v in yahoo_params.items()])
    
    # Contenido del archivo .ics
    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//E-Mind//Appointment Calendar//ES
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:{uid}
SUMMARY:{summary}
DESCRIPTION:{description}
LOCATION:{location}
DTSTART:{start_local}
DTEND:{end_local}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR
"""
    
    # Preparar el contexto para la plantilla
    context = {
        'nombre_paciente': f"{user.first_name} {user.last_name}",
        'nombre_psicologo': f"{psychologist.user.first_name} {psychologist.user.last_name}",
        'fecha_cita': fecha_cita,
        'hora_inicio': hora_inicio,
        'hora_fin': hora_fin,
        'google_calendar_url': google_calendar_url,
        'outlook_calendar_url': outlook_calendar_url,
        'yahoo_calendar_url': yahoo_calendar_url
    }
    
    # Definir asunto y plantilla
    subject = f'Tu cita del {fecha_cita} ha sido confirmada'
    template_name = 'emails/cita_confirmada_paciente.html'
    
    # Nombre del archivo adjunto
    file_name = f"Cita-EMind-{fecha_cita}.ics"
    
    # Verificar que tengamos las credenciales necesarias
    if not MAILGUN_API_KEY:
        logger.error("❌ Error: MAILGUN_API_KEY no está configurada")
        return False
        
    if not MAILGUN_DOMAIN:
        logger.error("❌ Error: MAILGUN_DOMAIN no está configurada")
        return False
    
    # Renderizar la plantilla HTML
    try:
        html_content = render_to_string(template_name, context)
    except Exception as e:
        logger.error(f"❌ Error al renderizar la plantilla {template_name}: {str(e)}")
        return False
    
    # URL de la API de Mailgun
    url = f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages"
    
    # Preparar los datos del mensaje con archivo adjunto
    data = {
        "from": f"E-Mind <{DEFAULT_FROM_EMAIL}>",
        "to": [user.email],
        "subject": subject,
        "html": html_content
    }
    
    # Crear archivo adjunto
    files = [
        ("attachment", (file_name, ics_content, "text/calendar"))
    ]
    
    # Enviar el correo usando la API de Mailgun
    try:
        response = requests.post(
            url,
            auth=("api", MAILGUN_API_KEY),
            data=data,
            files=files,
            timeout=10
        )
        
        # Verificar la respuesta
        if response.status_code == 200:
            logger.info(f"✅ Correo con archivo .ics enviado correctamente a {user.email} vía Mailgun API")
            return True
        else:
            logger.error(f"❌ Fallo al enviar correo a {user.email}: Código {response.status_code} - {response.text}")
            # Intentar decodificar el mensaje de error para más información
            try:
                error_data = response.json()
                logger.error(f"Detalles del error: {error_data}")
            except:
                pass
            return False
    except requests.exceptions.Timeout:
        logger.error(f"❌ Timeout al enviar correo a {user.email}: La petición a Mailgun tardó demasiado")
        return False
    except requests.exceptions.ConnectionError:
        logger.error(f"❌ Error de conexión al enviar correo a {user.email}: No se pudo conectar con Mailgun")
        return False
    except Exception as e:
        logger.error(f"❌ Error al enviar correo con archivo .ics a {user.email}: {str(e)}")
        return False

def send_appointment_confirmed_psychologist_email(appointment, frontend_url=None):
    """
    Envía correo al psicólogo cuando el paciente confirma la cita, después de que el administrador verifica el pago.
    
    Args:
        appointment: Instancia del modelo Appointment
        frontend_url: URL base del frontend (opcional)
    """
    psychologist = appointment.psychologist
    user_psy = psychologist.user
    client = appointment.client

    # Formatear la fecha y horas para presentación
    fecha_cita = appointment.date.strftime('%d/%m/%Y')
    hora_inicio = appointment.start_time.strftime('%H:%M')
    hora_fin = appointment.end_time.strftime('%H:%M')

    # --- Lógica para generar archivo .ics y URLs de calendario ---
    uid = str(uuid.uuid4())
    start_datetime = dt.datetime.combine(appointment.date, appointment.start_time)
    end_datetime = dt.datetime.combine(appointment.date, appointment.end_time)
    
    # Formatear fechas para .ics (formato local, sin UTC)
    start_local = start_datetime.strftime('%Y%m%dT%H%M%S')
    end_local = end_datetime.strftime('%Y%m%dT%H%M%S')
    
    # Formatear fechas para Google Calendar (formato ISO)
    start_iso = start_datetime.strftime('%Y%m%dT%H%M%S')
    end_iso = end_datetime.strftime('%Y%m%dT%H%M%S')
    
    # Datos para el evento
    summary = f"Sesión con {client.user.first_name} {client.user.last_name}"
    description = f"Cita de terapia a través de E-Mind con {client.user.first_name} {client.user.last_name}."
    location = "Videollamada"
    
    # Crear enlaces para diferentes calendarios
    # Google Calendar
    google_cal_params = {
        'action': 'TEMPLATE',
        'text': quote(summary),
        'dates': f"{start_iso}/{end_iso}",
        'details': quote(description),
        'location': quote(location),
    }
    google_calendar_url = "https://calendar.google.com/calendar/render?" + "&".join([f"{k}={v}" for k, v in google_cal_params.items()])
    
    # Outlook Web
    outlook_params = {
        'subject': quote(summary),
        'startdt': start_iso,
        'enddt': end_iso,
        'body': quote(description),
        'location': quote(location),
    }
    outlook_calendar_url = "https://outlook.live.com/calendar/0/deeplink/compose?" + "&".join([f"{k}={v}" for k, v in outlook_params.items()])
    
    # Yahoo Calendar 
    yahoo_params = {
        'title': quote(summary),
        'st': start_iso,
        'et': end_iso,
        'desc': quote(description),
        'in_loc': quote(location),
    }
    yahoo_calendar_url = "https://calendar.yahoo.com/?" + "&".join([f"{k}={v}" for k, v in yahoo_params.items()])
    
    # Contenido del archivo .ics
    ics_content = f"""BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//E-Mind//Appointment Calendar//ES\nCALSCALE:GREGORIAN\nBEGIN:VEVENT\nUID:{uid}\nSUMMARY:{summary}\nDESCRIPTION:{description}\nLOCATION:{location}\nDTSTART:{start_local}\nDTEND:{end_local}\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR\n"""
    
    # Nombre del archivo adjunto
    file_name = f"Cita-EMind-{fecha_cita}.ics"
    # --- Fin de la lógica de calendario ---

    # Preparar el contexto para la plantilla
    context = {
        'nombre_psicologo': f"{user_psy.first_name} {user_psy.last_name}",
        'nombre_paciente': f"{client.user.first_name} {client.user.last_name}",
        'fecha_cita': fecha_cita,
        'hora_inicio': hora_inicio,
        'hora_fin': hora_fin,
        'google_calendar_url': google_calendar_url,
        'outlook_calendar_url': outlook_calendar_url,
        'yahoo_calendar_url': yahoo_calendar_url
    }

    # Definir asunto y plantilla
    subject = f'Cita confirmada con {client.user.first_name} {client.user.last_name} - {fecha_cita}'
    template_name = 'emails/cita_confirmada_psicologo.html'

    # Preparar archivos adjuntos para Mailgun (formato tuple list: [(filename, content, content_type)])
    mailgun_attachments = [(file_name, ics_content, "text/calendar")]

    return send_email(
        user_psy.email,
        subject,
        template_name,
        context,
        attachments=mailgun_attachments
    )

def send_review_opportunity_email(appointment, frontend_url=None):
    """
    Envía un correo al paciente notificando que puede dejar un comentario/review.
    """
    client = appointment.client
    user = client.user
    psychologist = appointment.psychologist

    # Formatear la fecha para presentación
    fecha_cita = appointment.date.strftime('%d/%m/%Y')

    # Construir la URL para dejar la valoración (ajusta según tu frontend)
    if frontend_url:
        url_valoracion = f"https://emindapp.cl/dashboard/reviews"
    else:
        url_valoracion = "https://emindapp.cl/dashboard/reviews"

    context = {
        'nombre_paciente': f"{user.first_name} {user.last_name}",
        'nombre_psicologo': f"{psychologist.user.first_name} {psychologist.user.last_name}",
        'fecha_cita': fecha_cita,
        'url_valoracion': url_valoracion,
    }

    subject = '¡Valora tu sesión en E-Mind!'
    template_name = 'emails/comentario_oportunidad.html'

    return send_email(user.email, subject, template_name, context)