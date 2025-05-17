import os
import sys
import django
import logging
from pathlib import Path

# Configurar logger para este script
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

# Añadir el directorio del proyecto a la ruta de Python
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Importar después de configurar Django
from django.conf import settings
from backend.email_utils import send_email, MAILGUN_API_KEY, MAILGUN_DOMAIN, DEFAULT_FROM_EMAIL

def test_email_configuration():
    """Verificar que las variables de entorno necesarias estén configuradas"""
    logger.info("=== DIAGNÓSTICO DE CONFIGURACIÓN DE CORREO ===")
    
    # Verificar Mailgun API Key
    if MAILGUN_API_KEY:
        logger.info("✅ MAILGUN_API_KEY está configurada.")
    else:
        logger.error("❌ MAILGUN_API_KEY no está configurada.")
        
    # Verificar Mailgun Domain
    if MAILGUN_DOMAIN:
        logger.info(f"✅ MAILGUN_DOMAIN está configurado: {MAILGUN_DOMAIN}")
    else:
        logger.error("❌ MAILGUN_DOMAIN no está configurado.")
    
    # Verificar dirección de correo predeterminada
    if DEFAULT_FROM_EMAIL:
        logger.info(f"✅ DEFAULT_FROM_EMAIL está configurado: {DEFAULT_FROM_EMAIL}")
    else:
        logger.warning("⚠️ DEFAULT_FROM_EMAIL no está configurado. Se usará valor predeterminado.")
    
    # Verificar correo del administrador
    admin_email = os.getenv("ADMIN_EMAIL", "contacto@emindapp.cl")
    logger.info(f"✅ ADMIN_EMAIL (para formulario de contacto): {admin_email}")
    
    return all([MAILGUN_API_KEY, MAILGUN_DOMAIN])

def send_test_email(to_email=None):
    """Enviar un correo de prueba"""
    if not to_email:
        to_email = input("Ingresa un correo electrónico para la prueba: ").strip()
    
    logger.info(f"Enviando correo de prueba a {to_email}...")
    
    html_content = """
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h2 { color: #2A6877; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Correo de prueba de E-Mind</h2>
            <p>Este es un correo de prueba para verificar la configuración de Mailgun.</p>
            <p>Si estás viendo este mensaje, la configuración de correo está funcionando correctamente.</p>
            <p>Fecha y hora de envío: """ + django.utils.timezone.now().strftime('%Y-%m-%d %H:%M:%S') + """</p>
        </div>
    </body>
    </html>
    """
    
    result = send_email(
        to_email=to_email,
        subject="Prueba de configuración de correo E-Mind",
        template_content=html_content,
        is_html_template=True
    )
    
    if result:
        logger.info(f"✅ Correo de prueba enviado correctamente a {to_email}")
    else:
        logger.error(f"❌ Error al enviar correo de prueba a {to_email}")
    
    return result

if __name__ == "__main__":
    print("\n=== HERRAMIENTA DE DIAGNÓSTICO DE CORREO E-MIND ===\n")
    
    config_ok = test_email_configuration()
    
    if not config_ok:
        print("\n❌ La configuración de correo no está completa. Por favor verifica las variables de entorno.")
        sys.exit(1)
    
    print("\n¿Quieres enviar un correo de prueba? (s/n): ", end="")
    should_send = input().lower().strip()
    
    if should_send in ('s', 'si', 'sí', 'y', 'yes'):
        print("\nIngresa un correo electrónico para la prueba: ", end="")
        test_email = input().strip()
        if test_email:
            send_test_email(test_email)
        else:
            print("❌ No se proporcionó un correo válido.")
    
    print("\n=== DIAGNÓSTICO FINALIZADO ===\n") 