from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClientProfileViewSet, PsychologistProfileViewSet,
    PublicPsychologistListView, PsychologistDetailView,
    AdminProfileViewSet
)
from .views.public_views import PublicBankInfoView
from .views.admin_views import AdminStatisticsView

router = DefaultRouter()
router.register(r'client-profiles', ClientProfileViewSet, basename='client-profile')
router.register(r'psychologist-profiles', PsychologistProfileViewSet, basename='psychologist-profile')
router.register(r'admin-profiles', AdminProfileViewSet, basename='admin-profile')

urlpatterns = [
     path('', include(router.urls)),
     
     # Añadir el nuevo endpoint para estadísticas del dashboard de administrador
     path('admin/stats/dashboard/', AdminStatisticsView.as_view(), name='admin-dashboard-stats'),
     
     # Añadir el nuevo endpoint público para información bancaria
     path('bank-info/', PublicBankInfoView.as_view(), name='public-bank-info'),
     
     # Client profile endpoints
     path('client-profiles/me/upload_image/', 
          ClientProfileViewSet.as_view({'post': 'upload_image'}), 
          name='client-upload-image'),
     path('client-profiles/me/delete_image/', 
          ClientProfileViewSet.as_view({'delete': 'delete_image'}), 
          name='client-delete-image'),
     
     # Admin-specific client profile endpoints
     path('admin/client-profiles/', 
          ClientProfileViewSet.as_view({'get': 'admin_list'}), 
          name='admin-client-list'),
     path('admin/client-profiles/<int:pk>/', 
          ClientProfileViewSet.as_view({'get': 'admin_detail'}), 
          name='admin-client-detail'),
     path('admin/client-profiles/<int:pk>/toggle-status/', 
          ClientProfileViewSet.as_view({'patch': 'toggle_status'}), 
          name='admin-toggle-client-status'),
     
     # Add this new endpoint to match the frontend request
     path('admin/patients/', 
          ClientProfileViewSet.as_view({'get': 'admin_list'}), 
          name='admin-patients-list'),
     path('admin/patients/<int:pk>/', 
          ClientProfileViewSet.as_view({'get': 'admin_detail'}), 
          name='admin-patients-detail'),
     path('admin/patients/<int:pk>/status/', 
          ClientProfileViewSet.as_view({'patch': 'toggle_status'}), 
          name='admin-patients-toggle-status'),
          
     # Add admin psychologist management endpoints
     path('admin/psychologists/', 
          PsychologistProfileViewSet.as_view({'get': 'admin_list'}), 
          name='admin-psychologist-list'),
     path('admin/psychologists/<int:pk>/', 
          PsychologistProfileViewSet.as_view({'get': 'admin_detail'}), 
          name='admin-psychologist-detail'),
     path('admin/psychologists/<int:pk>/toggle-status/', 
          PsychologistProfileViewSet.as_view({'patch': 'toggle_verification_status'}), 
          name='admin-toggle-psychologist-status'),
     
     # Add this new endpoint for profile verification
     path('admin/psychologists/<int:pk>/verify/', 
          PsychologistProfileViewSet.as_view({'patch': 'update_verification_status'}), 
          name='admin-verify-psychologist'),
          
     path('admin/psychologists/<int:pk>/verification-documents/', 
          PsychologistProfileViewSet.as_view({'get': 'admin_verification_documents'}), 
          name='admin-psychologist-documents'),
     
     # Add this new endpoint for document status updates
     path('admin/psychologists/documents/<int:document_id>/status/', 
          PsychologistProfileViewSet.as_view({'patch': 'update_document_status'}), 
          name='admin-update-document-status'),
     
     # Psychologist profile endpoints
     path('psychologist-profiles/me/upload_image/', 
          PsychologistProfileViewSet.as_view({'post': 'upload_image'}), 
          name='psychologist-upload-image'),
     path('psychologist-profiles/me/delete_image/', 
          PsychologistProfileViewSet.as_view({'delete': 'delete_image'}), 
          name='psychologist-delete-image'),
     
     path('psychologist-profiles/me/experiences/', 
          PsychologistProfileViewSet.as_view({'get': 'experiences', 'post': 'update_experiences', 'delete': 'delete_experience', 'put': 'update_experience'}), 
          name='psychologist-experiences'),
         
     # Add admin profile endpoints
     path('admin-profiles/me/upload_image/', 
          AdminProfileViewSet.as_view({'post': 'upload_image'}), 
          name='admin-upload-image'),
     path('admin-profiles/me/delete_image/', 
          AdminProfileViewSet.as_view({'delete': 'delete_image'}), 
          name='admin-delete-image'),
     path('admin-profiles/me/bank-info/', 
          AdminProfileViewSet.as_view({'get': 'bank_info'}), 
          name='admin-bank-info'),
     
     # Add professional info update endpoint
     path('psychologist-profiles/me/professional-info/', 
          PsychologistProfileViewSet.as_view({'patch': 'update_professional_info'}), 
          name='psychologist-professional-info'),
     
     # Add verification document endpoints (both naming conventions)
     # Original naming
     path('psychologist-profiles/me/verification-documents/', 
          PsychologistProfileViewSet.as_view({'get': 'verification_documents'}), 
          name='psychologist-verification-documents'),
     path('psychologist-profiles/me/upload-verification-document/', 
          PsychologistProfileViewSet.as_view({'post': 'upload_verification_document'}), 
          name='psychologist-upload-verification-document'),
     path('psychologist-profiles/me/delete-verification-document/', 
          PsychologistProfileViewSet.as_view({'delete': 'delete_verification_document'}), 
          name='psychologist-delete-verification-document'),
     
     # Alternative naming (to match frontend)
     path('psychologist-profiles/me/documents/', 
          PsychologistProfileViewSet.as_view({'get': 'documents'}), 
          name='psychologist-documents'),
     path('psychologist-profiles/me/documents/', 
          PsychologistProfileViewSet.as_view({'post': 'upload_document'}), 
          name='psychologist-upload-document'),
     path('psychologist-profiles/me/documents/', 
          PsychologistProfileViewSet.as_view({'delete': 'delete_document'}), 
          name='psychologist-delete-document'),
     
     path('public/psychologists/', PublicPsychologistListView.as_view(), name='public-psychologists'),
     path('public/psychologists/<int:pk>/', PsychologistDetailView.as_view(), name='public-psychologist-detail'),
     path('public/psychologists/<int:pk>/experiences/', 
          PsychologistProfileViewSet.as_view({'get': 'public_experiences'}), 
          name='public-psychologist-experiences'),
     
     path('public/psychologists/<int:pk>/presentation-video/', 
          PsychologistProfileViewSet.as_view({'get': 'get_presentation_video'}), 
          name='psychologist-presentation-video'),
     
     # Add this to the urlpatterns list for psychologist (already exists)
     path('psychologist-profiles/me/update_bank_info/',
          PsychologistProfileViewSet.as_view({'patch': 'update_bank_info'}),
          name='psychologist-update-bank-info'),
     
     # Add new endpoints for client and admin bank info updates
     path('client-profiles/me/update_bank_info/',
          ClientProfileViewSet.as_view({'patch': 'update_bank_info'}),
          name='client-update-bank-info'),
     
     path('admin-profiles/me/update_bank_info/',
          AdminProfileViewSet.as_view({'patch': 'update_bank_info'}),
          name='admin-update-bank-info'),
          
     path('psychologist-profiles/me/experiences/<int:experience_id>/', 
          PsychologistProfileViewSet.as_view({'delete': 'delete_experience', 'put': 'update_experience'}), 
          name='psychologist-experience-detail'),

]

