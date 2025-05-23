from django.apps import AppConfig


class CommentsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "comments"
    verbose_name = 'Gestión de Valoraciones'

    def ready(self):
        import comments.signals  # noqa
