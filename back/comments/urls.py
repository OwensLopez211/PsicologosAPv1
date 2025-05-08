from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router para las vistas de administración
router = DefaultRouter()
router.register(r'admin', views.CommentAdminViewSet)

urlpatterns = [
    # Ruta para crear un comentario
    path('create/', views.CommentCreateView.as_view(), name='comment-create'),
    
    # Ruta para listar comentarios por psicólogo
    path('psychologist/<int:psychologist_id>/', views.CommentListByPsychologistView.as_view(), name='comment-by-psychologist'),
    
    # Ruta para que el cliente vea sus propios comentarios
    path('my-comments/', views.ClientCommentListView.as_view(), name='my-comments'),
    
    # Incluir rutas del router para administración
    path('', include(router.urls)),
] 