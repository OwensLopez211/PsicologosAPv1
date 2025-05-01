from django.contrib import admin
from .models import Schedule

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('psychologist', 'day_of_week', 'start_time', 'end_time')
    list_filter = ('day_of_week', 'psychologist')
    search_fields = ('psychologist__user__first_name', 'psychologist__user__last_name')
