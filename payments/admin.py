from django.contrib import admin
from .models import PaymentDetail

class PaymentDetailAdmin(admin.ModelAdmin):
    list_display = ('id', 'appointment', 'payment_method', 'transaction_id', 'payment_date', 'created_at')
    list_filter = ('payment_method', 'created_at')
    search_fields = ('appointment__client__user__email', 'appointment__psychologist__user__email', 'transaction_id')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Relación', {
            'fields': ('appointment',)
        }),
        ('Detalles de Pago', {
            'fields': ('payment_method', 'transaction_id', 'payment_date')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    raw_id_fields = ('appointment',)

admin.site.register(PaymentDetail, PaymentDetailAdmin)
