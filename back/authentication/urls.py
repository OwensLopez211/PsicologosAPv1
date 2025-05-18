from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, UserProfileView, CustomTokenObtainPairView, 
    CustomTokenRefreshView, ChangePasswordView, SendWelcomeEmailView,
    PasswordResetRequestView, PasswordResetConfirmView, VerifyResetTokenView
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    # Replace the default TokenRefreshView with our custom one
    path('auth/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    # Nueva ruta para enviar correos de bienvenida a usuarios existentes
    path('admin/send-welcome-email/', SendWelcomeEmailView.as_view(), name='send-welcome-email'),
    
    # Rutas para recuperación de contraseña
    path('auth/request-password-reset/', PasswordResetRequestView.as_view(), name='request-password-reset'),
    path('auth/reset-password/', PasswordResetConfirmView.as_view(), name='reset-password'),
    path('auth/verify-reset-token/', VerifyResetTokenView.as_view(), name='verify-reset-token'),
]