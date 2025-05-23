from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router para las vistas principales
router = DefaultRouter()
router.register(r'admin/reviews', views.CommentAdminViewSet, basename='admin-reviews')

urlpatterns = [
    # Incluir rutas del router
    path('', include(router.urls)),
    
    # Rutas para clientes (mover al principio para darles prioridad)
    path('client/reviews/', 
         views.ClientCommentListView.as_view(), 
         name='client-reviews'),
    path('client/pending-appointments/', 
         views.PendingAppointmentsView.as_view(), 
         name='pending-appointments'),
    path('client/submit/', 
         views.CommentCreateView.as_view(), 
         name='submit-review'),
         
    # Rutas para psicólogos
    path('psychologist/reviews/', 
         views.PsychologistReviewsView.as_view(), 
         name='psychologist-reviews'),
    
    # Rutas públicas
    path('public/psychologist/<int:psychologist_id>/reviews/', 
         views.CommentListByPsychologistView.as_view(), 
         name='public-psychologist-reviews'),
]