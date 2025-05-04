from django.urls import path
from .views import (
    PriceConfigurationViewSet,
    PsychologistPriceViewSet,
    SuggestedPriceViewSet,
    PriceChangeRequestViewSet
)

urlpatterns = [
    # Rutas de PriceConfiguration
    path('configurations/', 
         PriceConfigurationViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='price-configuration-list'),
    path('configurations/<int:pk>/', 
         PriceConfigurationViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='price-configuration-detail'),
    path('configurations/current/', 
         PriceConfigurationViewSet.as_view({'get': 'current'}), 
         name='current-price-configuration'),
    
    # Rutas de PsychologistPrice
    path('psychologist-prices/', 
         PsychologistPriceViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='psychologist-price-list'),
    path('psychologist-prices/<int:pk>/', 
         PsychologistPriceViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='psychologist-price-detail'),
    path('psychologist-prices/my-price/', 
         PsychologistPriceViewSet.as_view({'get': 'my_price'}), 
         name='my-psychologist-price'),
    path('psychologist-prices/psychologist/<int:psychologist_id>/', 
         PsychologistPriceViewSet.as_view({'get': 'get_psychologist_price'}), 
         name='get-psychologist-price'),
    path('psychologist-prices/set_psychologist_price/<int:psychologist_id>/', 
         PsychologistPriceViewSet.as_view({'post': 'set_psychologist_price'}), 
         name='set-psychologist-price'),
    
    # Rutas de SuggestedPrice
    path('suggested-prices/', 
         SuggestedPriceViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='suggested-price-list'),
    path('suggested-prices/<int:pk>/', 
         SuggestedPriceViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='suggested-price-detail'),
    path('suggested-prices/my-suggestion/', 
         SuggestedPriceViewSet.as_view({'get': 'my-suggestion', 'post': 'my-suggestion'}), 
         name='my-suggested-price'),
    path('suggested-prices/psychologist/<int:psychologist_id>/', 
         SuggestedPriceViewSet.as_view({'get': 'get_psychologist_suggested_price'}), 
         name='get-psychologist-suggested-price'),
    
    # Rutas de PriceChangeRequest
    path('change-requests/', 
         PriceChangeRequestViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='price-change-request-list'),
    path('change-requests/<int:pk>/', 
         PriceChangeRequestViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='price-change-request-detail'),
    path('change-requests/<int:pk>/approve/', 
         PriceChangeRequestViewSet.as_view({'post': 'approve'}), 
         name='approve-price-change-request'),
    path('change-requests/<int:pk>/reject/', 
         PriceChangeRequestViewSet.as_view({'post': 'reject'}), 
         name='reject-price-change-request'),
]