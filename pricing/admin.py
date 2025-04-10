from django.contrib import admin
from .models import PriceConfiguration, PsychologistPrice, PriceChangeRequest, PromotionalDiscount

@admin.register(PriceConfiguration)
class PriceConfigurationAdmin(admin.ModelAdmin):
    list_display = ('id', 'min_price', 'max_price', 'platform_fee_percentage', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(PsychologistPrice)
class PsychologistPriceAdmin(admin.ModelAdmin):
    list_display = ('id', 'psychologist', 'price', 'is_approved', 'updated_at')
    list_filter = ('is_approved', 'created_at')
    search_fields = ('psychologist__user__first_name', 'psychologist__user__last_name', 'psychologist__user__email')
    readonly_fields = ('created_at', 'updated_at')
    
    def get_psychologist_name(self, obj):
        return obj.psychologist.user.get_full_name()
    get_psychologist_name.short_description = 'Psicólogo'

@admin.register(PriceChangeRequest)
class PriceChangeRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'psychologist', 'current_price', 'requested_price', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('psychologist__user__first_name', 'psychologist__user__last_name', 'psychologist__user__email')
    readonly_fields = ('created_at', 'updated_at')
    
    def get_psychologist_name(self, obj):
        return obj.psychologist.user.get_full_name()
    get_psychologist_name.short_description = 'Psicólogo'

@admin.register(PromotionalDiscount)
class PromotionalDiscountAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'code', 'discount_percentage', 'start_date', 'end_date', 'is_active', 'current_uses', 'max_uses')
    list_filter = ('is_active', 'start_date', 'end_date')
    search_fields = ('name', 'code')
    readonly_fields = ('current_uses', 'created_at')
