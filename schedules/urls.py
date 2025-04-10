from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ScheduleViewSet

router = DefaultRouter()
router.register(r'', ScheduleViewSet, basename='schedule')

urlpatterns = [
    path('', include(router.urls)),
    # Add explicit paths for the schedule endpoints
    path('psychologist-schedule/', ScheduleViewSet.as_view({
        'get': 'psychologist_schedule',
    }), name='psychologist-schedule'),
    path('psychologist-schedule/update/', ScheduleViewSet.as_view({
        'patch': 'update_psychologist_schedule',
    }), name='update-psychologist-schedule'),
    path('psychologist/<int:pk>/', ScheduleViewSet.as_view({
        'get': 'psychologist',
    }), name='psychologist-schedule-detail'),
]