from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet

router = DefaultRouter()
router.register(r'', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('', include(router.urls)),
    # Add explicit paths for the appointment endpoints
    path('available-slots/', AppointmentViewSet.as_view({
        'get': 'available_slots',
    }), name='available-slots'),
    path('create/', AppointmentViewSet.as_view({
        'post': 'create_with_payment',
    }), name='create-with-payment'),
    path('<int:pk>/upload-payment/', AppointmentViewSet.as_view({
        'post': 'upload_payment',
    }), name='upload-payment'),
    path('<int:pk>/verify-payment/', AppointmentViewSet.as_view({
        'post': 'verify_payment',
    }), name='verify-payment'),
    # Nuevos endpoints para psicólogos
    path('my-appointments/', AppointmentViewSet.as_view({
        'get': 'my_appointments',
    }), name='my-appointments'),
    path('<int:pk>/update-status/', AppointmentViewSet.as_view({
        'patch': 'update_status',
    }), name='update-status'),
    path('<int:pk>/add-notes/', AppointmentViewSet.as_view({
        'patch': 'add_notes',
    }), name='add-notes'),
    # Nuevo endpoint para clientes - both with and without trailing slash
    path('client-appointments/', AppointmentViewSet.as_view({
        'get': 'client_appointments',
    }), name='client-appointments'),
    path('client-appointments', AppointmentViewSet.as_view({
        'get': 'client_appointments',
    }), name='client-appointments-no-slash'),
    # The psychologist appointments endpoint will be handled by the router
    # It will be available at: /api/appointments/psychologist/{id}/
    path('has-confirmed-appointments/<int:pk>/', AppointmentViewSet.as_view({
        'get': 'has_confirmed_appointments',
    }), name='has-confirmed-appointments'),
    
    # Nuevos endpoints para verificación de pagos
    path('admin-payment-verification/', AppointmentViewSet.as_view({
        'get': 'admin_payment_verification',
    }), name='admin-payment-verification'),
    path('admin_payment_verification/', AppointmentViewSet.as_view({
        'get': 'admin_payment_verification',
    }), name='admin_payment_verification'),
    path('psychologist-pending-payments/', AppointmentViewSet.as_view({
        'get': 'psychologist_pending_payments',
    }), name='psychologist-pending-payments'),
    path('<int:pk>/update-payment-status/', AppointmentViewSet.as_view({
        'patch': 'update_payment_status',
    }), name='update-payment-status'),
    
    # Nuevo endpoint para descargar comprobante de pago
    path('<int:pk>/download-payment-proof/', AppointmentViewSet.as_view({
        'get': 'download_payment_proof',
    }), name='download-payment-proof'),
]