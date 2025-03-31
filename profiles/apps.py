from django.apps import AppConfig

class ProfilesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'profiles'
    
    def ready(self):
        try:
            import profiles.signals  # Importar signals cuando la app esté lista
            print("Profiles signals imported successfully!")
        except ImportError as e:
            print(f"Error importing profiles signals: {e}")