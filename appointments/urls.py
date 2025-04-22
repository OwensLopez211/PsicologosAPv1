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
    path('has-completed-appointments/<int:pk>/', AppointmentViewSet.as_view({
        'get': 'has_completed_appointments',
    }), name='has-completed-appointments'),
]