
# middleware/timezone.py

from django.utils import timezone

class TimezoneMiddleware:
    """
    Middleware para asegurar que Django no realice conversiones automáticas de zona horaria.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Desactivar explícitamente el uso de zonas horarias
        timezone.deactivate()
        return self.get_response(request)