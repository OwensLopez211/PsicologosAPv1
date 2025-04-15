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
    # The psychologist appointments endpoint will be handled by the router
    # It will be available at: /api/appointments/psychologist/{id}/
]