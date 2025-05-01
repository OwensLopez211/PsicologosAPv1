from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentDetailViewSet

router = DefaultRouter()
router.register(r'', PaymentDetailViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('create-with-appointment/', PaymentDetailViewSet.as_view({
        'post': 'create_with_appointment',
    }), name='create-with-appointment'),
    path('pending-payments/', PaymentDetailViewSet.as_view({
        'get': 'pending_payments',
    }), name='pending-payments'),
    # Ruta específica para psicólogos
    path('psychologist/pending-payments/', PaymentDetailViewSet.as_view({
        'get': 'pending_payments',
    }), name='psychologist-pending-payments'),
    # Añadir esta nueva ruta específica para administradores
    path('admin/pending-payments/', PaymentDetailViewSet.as_view({
        'get': 'pending_payments',
    }), name='admin-pending-payments'),
    path('<int:pk>/psychologist-verify/', PaymentDetailViewSet.as_view({
        'post': 'psychologist_verify_payment',
    }), name='psychologist-verify-payment'),
    path('view-payment-proof/<int:appointment_id>/', PaymentDetailViewSet.as_view({
        'get': 'view_payment_proof',
    }), name='view-payment-proof'),
    # Añadir estas rutas
    path('admin/all-payments/', PaymentDetailViewSet.as_view({
        'get': 'all_payments',
    }), name='admin-all-payments'),
    path('psychologist/all-payments/', PaymentDetailViewSet.as_view({
        'get': 'all_payments',
    }), name='psychologist-all-payments'),
    path('admin/verify-payment/<int:pk>/', PaymentDetailViewSet.as_view({
        'post': 'admin_verify_payment',
    }), name='admin-verify-payment'),
]