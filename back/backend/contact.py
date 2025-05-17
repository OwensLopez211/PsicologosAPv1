from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle
from django.template.loader import render_to_string
from .email_utils import send_email
import os
import re
import logging

# Configurar logger
logger = logging.getLogger(__name__)

# Definir un limitador de velocidad específico para el formulario de contacto
class ContactFormRateThrottle(AnonRateThrottle):
    rate = '5/hour'  # 5 solicitudes por hora por IP

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([ContactFormRateThrottle])
def contact_form(request):
    """
    Endpoint para procesar el formulario de contacto y enviar un correo
    """
    try:
        # Obtener los datos del formulario
        data = request.data
        nombre = data.get('nombre', '').strip()
        correo = data.get('correo', '').strip()
        mensaje = data.get('mensaje', '').strip()
        
        # Validación básica
        if not nombre or not correo or not mensaje:
            return Response(
                {"error": "Todos los campos son obligatorios."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar longitud mínima
        if len(nombre) < 2:
            return Response(
                {"error": "El nombre debe tener al menos 2 caracteres."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if len(mensaje) < 10:
            return Response(
                {"error": "El mensaje debe tener al menos 10 caracteres."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar formato de correo
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, correo):
            return Response(
                {"error": "Por favor, proporciona un correo electrónico válido."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validación antispam simple: verificar que el mensaje no contenga demasiados URLs
        url_count = len(re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', mensaje))
        if url_count > 3:
            logger.warning(f"Posible spam detectado: {correo}, {request.META.get('REMOTE_ADDR')}")
            return Response(
                {"error": "Su mensaje ha sido identificado como posible spam."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Preparar el contexto para la plantilla
        context = {
            'nombre': nombre,
            'correo': correo,
            'mensaje': mensaje,
            'ip_address': request.META.get('REMOTE_ADDR', 'Desconocida'),
            'user_agent': request.META.get('HTTP_USER_AGENT', 'Desconocido')
        }
        
        # Enviar correo al administrador
        admin_email = os.getenv("ADMIN_EMAIL", "contacto@emindapp.cl")
        subject = f"Nuevo mensaje de contacto de {nombre}"
        
        # Utilizar la plantilla HTML para el correo
        html_message = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                h2 {{ color: #2A6877; }}
                .message {{ background-color: #f5f5f5; padding: 15px; border-radius: 5px; }}
                .footer {{ margin-top: 20px; font-size: 12px; color: #777; }}
                .meta {{ margin-top: 20px; font-size: 11px; color: #999; background-color: #f9f9f9; padding: 10px; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Nuevo mensaje de contacto</h2>
                <p><strong>Nombre:</strong> {nombre}</p>
                <p><strong>Correo:</strong> <a href="mailto:{correo}">{correo}</a></p>
                <div class="message">
                    <p><strong>Mensaje:</strong></p>
                    <p>{mensaje}</p>
                </div>
                <div class="meta">
                    <p><strong>Información adicional:</strong></p>
                    <p>IP: {context['ip_address']}</p>
                    <p>Navegador: {context['user_agent']}</p>
                    <p>Fecha y hora: {context.get('date_time', 'No disponible')}</p>
                </div>
                <div class="footer">
                    <p>Este mensaje fue enviado desde el formulario de contacto de E-Mind.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Enviar el correo utilizando la función existente en email_utils.py
        admin_email_sent = send_email(
            to_email=admin_email,
            subject=subject,
            template_content=html_message,
            is_html_template=True
        )
        
        if not admin_email_sent:
            logger.error(f"No se pudo enviar el correo al administrador para: {correo}")
            return Response(
                {"error": "Error al procesar el formulario. Por favor, intenta más tarde."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # También enviar un correo de confirmación al remitente
        confirmation_subject = "Hemos recibido tu mensaje - E-Mind"
        confirmation_message = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                h2 {{ color: #2A6877; }}
                .highlight {{ color: #2A6877; font-weight: bold; }}
                .footer {{ margin-top: 20px; font-size: 12px; color: #777; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>¡Gracias por contactarnos!</h2>
                <p>Hola {nombre},</p>
                <p>Hemos recibido tu mensaje y nos pondremos en contacto contigo a la brevedad posible.</p>
                <p><strong>Tu mensaje:</strong></p>
                <p><em>"{mensaje[0:100]}{'...' if len(mensaje) > 100 else ''}"</em></p>
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                <div class="footer">
                    <p>E-Mind - Tu plataforma de terapia online</p>
                    <p><a href="https://emindapp.cl">emindapp.cl</a></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Enviar correo de confirmación (no es crítico si falla)
        try:
            send_email(
                to_email=correo,
                subject=confirmation_subject,
                template_content=confirmation_message,
                is_html_template=True
            )
        except Exception as e:
            logger.warning(f"No se pudo enviar el correo de confirmación a {correo}: {str(e)}")
        
        # Registrar el éxito
        logger.info(f"Formulario de contacto procesado correctamente: {correo}")
        return Response({"message": "Mensaje enviado correctamente"}, status=status.HTTP_200_OK)
        
    except Exception as e:
        # Registrar el error para depuración
        logger.error(f"Error al procesar el formulario de contacto: {str(e)}")
        return Response(
            {"error": "Ocurrió un error al procesar tu solicitud. Por favor, intenta más tarde."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 