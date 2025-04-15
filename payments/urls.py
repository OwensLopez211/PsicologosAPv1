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
]