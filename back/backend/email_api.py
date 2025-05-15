import os
import requests

# Configura tus credenciales
MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY")
MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL")

# URL de la API de Mailgun
url = f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages"

# Datos del mensaje
data = {
    "from": f"MentAliza <{DEFAULT_FROM_EMAIL}>",
    "to": ["owenslopez211@gmail.com"],
    "subject": "✅ Test Mailgun API desde producción",
    "text": "Este es un mensaje alternativo en texto plano.",
    "html": "<h2>¡Hola Owens!</h2><p>Correo de prueba enviado vía <strong>Mailgun API</strong>.</p>"
}

# Envía el mensaje
try:
    response = requests.post(
        url,
        auth=("api", MAILGUN_API_KEY),
        data=data
    )

    # Verifica la respuesta
    if response.status_code == 200:
        print("✅ Correo enviado correctamente vía Mailgun API")
    else:
        print(f"❌ Fallo al enviar correo: {response.status_code} {response.text}")
except Exception as e:
    print(f"❌ Error al enviar correo: {str(e)}")
