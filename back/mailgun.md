# Configuración de Mailgun para E-Mind

Para hacer funcionar el sistema de correos, necesitas configurar las siguientes variables de entorno en el archivo `.env` en el directorio `back/`:

```
# Credenciales de Mailgun para enviar correos
MAILGUN_API_KEY=tu-api-key-aqui
MAILGUN_DOMAIN=tu-dominio-aqui
DEFAULT_FROM_EMAIL=no-reply@emindapp.cl
```

## Configuración de la cuenta de Mailgun

1. Visita [https://www.mailgun.com/](https://www.mailgun.com/) y crea una cuenta o inicia sesión.
2. En el dashboard, agrega un dominio o utiliza el Sandbox domain proporcionado por Mailgun.
3. Obtén tu API Key desde la sección de "API Keys".
4. Si estás utilizando un dominio Sandbox, recuerda que solo podrás enviar correos a direcciones de correo autorizadas previamente en el panel de Mailgun.

## Probando el envío de correos

Puedes probar el funcionamiento del sistema de correos mediante:

1. Registro de un nuevo usuario (se enviará automáticamente).
2. Envío manual a través del endpoint de administrador: `/api/admin/send-welcome-email/`.
3. Cambio de estado de verificación de un psicólogo.

Si encuentras problemas:
- Verifica que has configurado correctamente las variables de entorno
- Revisa los logs en la consola para ver mensajes de error
- Asegúrate de tener saldo disponible en tu cuenta de Mailgun 