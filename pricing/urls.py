from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PriceConfigurationViewSet,
    PsychologistPriceViewSet,
    SuggestedPriceViewSet,
    PriceChangeRequestViewSet
)

router = DefaultRouter()
router.register(r'configurations', PriceConfigurationViewSet)
router.register(r'psychologist-prices', PsychologistPriceViewSet)
router.register(r'suggested-prices', SuggestedPriceViewSet)
router.register(r'change-requests', PriceChangeRequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
]