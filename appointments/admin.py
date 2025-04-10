from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'client', 'psychologist', 'date', 'start_time', 'end_time', 'status')
    list_filter = ('status', 'date')
    search_fields = ('client__user__first_name', 'client__user__last_name', 
                     'psychologist__user__first_name', 'psychologist__user__last_name')
    # Remove any references to notes or client_notes fields