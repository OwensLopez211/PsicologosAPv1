from django.contrib import admin
from .models import ClientProfile, PsychologistProfile, ProfessionalDocument, AdminProfile

class ProfessionalDocumentInline(admin.TabularInline):
    model = ProfessionalDocument
    extra = 1
    readonly_fields = ('is_verified', 'verification_status', 'rejection_reason', 'uploaded_at', 'verified_at')

@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ('get_email', 'get_name', 'phone_number', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'phone_number')
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
    
    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_name.short_description = 'Nombre'

@admin.register(PsychologistProfile)
class PsychologistProfileAdmin(admin.ModelAdmin):
    # Eliminar is_verified de list_display
    list_display = ('get_email', 'get_name', 'professional_title', 'verification_status')
    
    # Eliminar is_verified de list_filter
    list_filter = ('verification_status',)
    
    # El resto de la configuración permanece igual
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'professional_title')
    inlines = [ProfessionalDocumentInline]
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
    
    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_name.short_description = 'Nombre'

@admin.register(ProfessionalDocument)
class ProfessionalDocumentAdmin(admin.ModelAdmin):
    list_display = ('psychologist', 'document_type', 'is_verified', 'uploaded_at')
    list_filter = ('document_type', 'is_verified')
    search_fields = ('psychologist__user__email', 'description')

