from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Comment

@receiver(post_save, sender=Comment)
def handle_comment_status_change(sender, instance, created, **kwargs):
    """
    Manejador de señal para cuando se crea o actualiza una valoración.
    Puede ser extendido para enviar notificaciones o realizar otras acciones.
    """
    if created:
        # Aquí puedes agregar lógica para cuando se crea una nueva valoración
        # Por ejemplo, enviar notificaciones al psicólogo
        pass
    else:
        # Aquí puedes agregar lógica para cuando se actualiza una valoración
        # Por ejemplo, notificar al cliente cuando su valoración es aprobada/rechazada
        pass 