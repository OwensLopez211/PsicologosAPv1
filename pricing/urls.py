from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PriceConfigurationViewSet,
    PsychologistPriceViewSet,
    PriceChangeRequestViewSet,
    PromotionalDiscountViewSet
)

router = DefaultRouter()
router.register(r'configurations', PriceConfigurationViewSet, basename='price-configuration')
router.register(r'psychologist-prices', PsychologistPriceViewSet, basename='psychologist-price')
router.register(r'change-requests', PriceChangeRequestViewSet, basename='price-change-request')
router.register(r'discounts', PromotionalDiscountViewSet, basename='promotional-discount')

urlpatterns = [
    path('', include(router.urls)),
]