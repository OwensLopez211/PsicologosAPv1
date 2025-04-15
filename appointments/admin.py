from django.contrib import admin
from .models import Appointment

class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'psychologist', 'client', 'date', 'start_time', 'end_time', 'status', 'payment_amount')
    list_filter = ('status', 'date', 'psychologist')
    search_fields = ('psychologist__user__email', 'client__user__email', 'psychologist__user__first_name', 'client__user__first_name')
    date_hierarchy = 'date'
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Relaciones', {
            'fields': ('psychologist', 'client')
        }),
        ('Información de la cita', {
            'fields': ('date', 'start_time', 'end_time', 'status')
        }),
        ('Información de pago', {
            'fields': ('payment_amount', 'payment_proof', 'payment_verified_by')
        }),
        ('Notas', {
            'fields': ('client_notes', 'psychologist_notes', 'admin_notes')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at')
        }),
    )

admin.site.register(Appointment, AppointmentAdmin)
