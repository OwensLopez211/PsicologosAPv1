from django.contrib import admin
from .models import Comment

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_patient_name', 'get_psychologist_name', 'rating', 'created_at', 'status')
    list_filter = ('status', 'rating', 'created_at')
    search_fields = ('patient__user__email', 'psychologist__user__email', 'text')
    date_hierarchy = 'created_at'
    actions = ['approve_comments', 'reject_comments']
    
    fieldsets = (
        ('Relaciones', {
            'fields': ('psychologist', 'patient', 'appointment')
        }),
        ('Contenido', {
            'fields': ('text', 'rating')
        }),
        ('Estado', {
            'fields': ('status', 'created_at')
        }),
    )
    
    readonly_fields = ('created_at',)
    
    def get_patient_name(self, obj):
        return obj.patient.user.get_full_name() or obj.patient.user.email
    get_patient_name.short_description = 'Paciente'
    
    def get_psychologist_name(self, obj):
        return obj.psychologist.user.get_full_name() or obj.psychologist.user.email
    get_psychologist_name.short_description = 'Psicólogo'
    
    def approve_comments(self, request, queryset):
        queryset.update(status='APPROVED')
    approve_comments.short_description = "Aprobar comentarios seleccionados"
    
    def reject_comments(self, request, queryset):
        queryset.update(status='REJECTED')
    reject_comments.short_description = "Rechazar comentarios seleccionados"
