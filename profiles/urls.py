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
    # Explicitly register the upload_image endpoint
    path('psychologist-profiles/me/upload_image/', 
         PsychologistProfileViewSet.as_view({'post': 'upload_image'}), 
         name='psychologist-upload-image'),
    # Add professional info update endpoint
    path('psychologist-profiles/me/professional-info/', 
         PsychologistProfileViewSet.as_view({'patch': 'update_professional_info'}), 
         name='psychologist-professional-info'),
    path('public/psychologists/', PublicPsychologistListView.as_view(), name='public-psychologists'),
    path('public/psychologists/<int:pk>/', PsychologistDetailView.as_view(), name='public-psychologist-detail'),
]