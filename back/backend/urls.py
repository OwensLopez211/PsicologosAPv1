from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('djadmin/', admin.site.urls),
    path('api/', include('authentication.urls')),
    path('api/profiles/', include('profiles.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/schedules/', include('schedules.urls')), 
    path('api/pricing/', include('pricing.urls')),
    path('api/payments/', include('payments.urls')),  # Added trailing slash
    # path('api/', include('settlements.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Error handlers
handler404 = 'django.views.defaults.page_not_found'
handler500 = 'django.views.defaults.server_error'
handler403 = 'django.views.defaults.permission_denied'
handler400 = 'django.views.defaults.bad_request'