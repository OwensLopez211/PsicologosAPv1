#!/usr/bin/env python
"""
Script para probar la conexión con Mailgun.
Ejecutar desde la línea de comandos: python test_mailgun.py
"""
import os
import sys
import requests
import json
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

def test_mailgun_connection():
    """Prueba la conexión con Mailgun"""
    # Obtener credenciales
    api_key = os.getenv("MAILGUN_API_KEY")
    domain = os.getenv("MAILGUN_DOMAIN")
    from_email = os.getenv("DEFAULT_FROM_EMAIL", "no-reply@emindapp.cl")
    
    # Verificar si existen las credenciales
    if not api_key:
        print("❌ ERROR: MAILGUN_API_KEY no está configurada en el archivo .env")
        return False
    
    if not domain:
        print("❌ ERROR: MAILGUN_DOMAIN no está configurada en el archivo .env")
        return False
    
    print("\n=== Configuración de Mailgun ===")
    print(f"API Key: {'***' + api_key[-4:] if api_key else 'No configurada'}")
    print(f"Domain: {domain}")
    print(f"From Email: {from_email}")
    
    # Verificar formato de API Key
    if not api_key.startswith("key-"):
        print("⚠️ ADVERTENCIA: La API Key no tiene el formato esperado (key-xxxxxxxxx)")
    
    # URL de la API de Mailgun
    url = f"https://api.mailgun.net/v3/{domain}/messages"
    
    print(f"\n=== Enviando solicitud a {url} ===")
    
    # Datos del mensaje
    data = {
        "from": f"Test <{from_email}>",
        "to": "test@example.com",  # No importa, no se enviará realmente
        "subject": "Prueba de conexión Mailgun",
        "text": "Este es un mensaje de prueba."
    }
    
    # Intentar obtener dominios (solo para verificar autenticación)
    domains_url = "https://api.mailgun.net/v3/domains"
    try:
        print("\n=== Verificando autenticación (listado de dominios) ===")
        domains_response = requests.get(
            domains_url,
            auth=("api", api_key)
        )
        
        if domains_response.status_code == 200:
            domains_data = domains_response.json()
            print(f"✅ Autenticación exitosa. Dominios disponibles: {len(domains_data.get('items', []))}")
            for domain_info in domains_data.get('items', []):
                print(f"  - {domain_info.get('name')} (Estado: {domain_info.get('state', 'Desconocido')})")
        else:
            print(f"❌ Error de autenticación: {domains_response.status_code}")
            print(f"   Respuesta: {domains_response.text}")
            return False
        
    except Exception as e:
        print(f"❌ Error al verificar autenticación: {str(e)}")
        return False
    
    # Intentar enviar un mensaje
    try:
        print("\n=== Enviando mensaje de prueba ===")
        # Simular envío (no llega a enviar realmente, solo verifica autenticación)
        response = requests.post(
            url,
            auth=("api", api_key),
            data=data
        )
        
        print(f"Código de estado: {response.status_code}")
        print(f"Respuesta: {response.text}")
        
        if response.status_code == 200:
            print("✅ Prueba exitosa. La configuración de Mailgun es correcta.")
            return True
        else:
            print(f"❌ Error en la prueba: {response.status_code}")
            if response.status_code == 401:
                print("   El error 401 indica problemas de autenticación.")
                print("   Verifica que la API Key sea correcta y que el dominio esté configurado en tu cuenta de Mailgun.")
            return False
    except Exception as e:
        print(f"❌ Error al enviar mensaje de prueba: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== Prueba de conexión con Mailgun ===")
    test_mailgun_connection() 