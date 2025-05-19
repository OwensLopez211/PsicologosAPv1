from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet

router = DefaultRouter()
router.register(r'', AppointmentViewSet, basename='appointment')

urlpatterns = [
    # URL de prueba sin restricciones
    path('test-stats/', AppointmentViewSet.as_view({
        'get': 'test_stats',
    }), name='test-stats'),
    
    path('dashboard-stats/', AppointmentViewSet.as_view({
        'get': 'client_stats',
    }), name='dashboard-stats'),
    
    path('client-stats/', AppointmentViewSet.as_view({
        'get': 'client_stats',
    }), name='client-stats'),
    
    path('client_stats/', AppointmentViewSet.as_view({
        'get': 'client_stats',
    }), name='client_stats'),
    
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
    path('my-appointments/', AppointmentViewSet.as_view({
        'get': 'my_appointments',
    }), name='my-appointments'),
    path('<int:pk>/update-status/', AppointmentViewSet.as_view({
        'patch': 'update_status',
    }), name='update-status'),
    path('<int:pk>/add-notes/', AppointmentViewSet.as_view({
        'patch': 'add_notes',
    }), name='add-notes'),
    path('client-appointments/', AppointmentViewSet.as_view({
        'get': 'client_appointments',
    }), name='client-appointments'),
    path('client-appointments', AppointmentViewSet.as_view({
        'get': 'client_appointments',
    }), name='client-appointments-no-slash'),
    path('has-confirmed-appointments/<int:pk>/', AppointmentViewSet.as_view({
        'get': 'has_confirmed_appointments',
    }), name='has-confirmed-appointments'),
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
    path('<int:pk>/download-payment-proof/', AppointmentViewSet.as_view({
        'get': 'download_payment_proof',
    }), name='download-payment-proof'),
    path('<int:pk>/is-first-appointment/', AppointmentViewSet.as_view({
        'get': 'is_first_appointment',
    }), name='is-first-appointment'),
    path('psychologist-patients/', AppointmentViewSet.as_view({
        'get': 'psychologist_patients',
    }), name='psychologist-patients'),
    path('psychologist_patients/', AppointmentViewSet.as_view({
        'get': 'psychologist_patients',
    }), name='psychologist_patients'),
    path('', include(router.urls)),
]