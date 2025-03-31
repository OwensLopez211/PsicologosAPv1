from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClientProfileViewSet, PsychologistProfileViewSet,
    PublicPsychologistListView, PsychologistDetailView
)

router = DefaultRouter()
router.register(r'client-profiles', ClientProfileViewSet, basename='client-profile')
router.register(r'psychologist-profiles', PsychologistProfileViewSet, basename='psychologist-profile')

urlpatterns = [
    path('', include(router.urls)),
    path('public/psychologists/', PublicPsychologistListView.as_view(), name='public-psychologists'),
    path('public/psychologists/<int:pk>/', PsychologistDetailView.as_view(), name='public-psychologist-detail'),
]