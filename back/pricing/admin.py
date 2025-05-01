from django.contrib import admin
from .models import PriceConfiguration, PsychologistPrice, SuggestedPrice, PriceChangeRequest

@admin.register(PriceConfiguration)
class PriceConfigurationAdmin(admin.ModelAdmin):
    list_display = ('id', 'min_price', 'max_price', 'platform_fee_percentage', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('min_price', 'max_price')


@admin.register(PsychologistPrice)
class PsychologistPriceAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_psychologist_name', 'price', 'is_approved', 'created_at')
    list_filter = ('is_approved',)
    search_fields = ('psychologist__user__first_name', 'psychologist__user__last_name', 'price')
    
    def get_psychologist_name(self, obj):
        return obj.psychologist.user.get_full_name()
    get_psychologist_name.short_description = 'Psychologist'


@admin.register(SuggestedPrice)
class SuggestedPriceAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_psychologist_name', 'price', 'created_at')
    search_fields = ('psychologist__user__first_name', 'psychologist__user__last_name', 'price')
    
    def get_psychologist_name(self, obj):
        return obj.psychologist.user.get_full_name()
    get_psychologist_name.short_description = 'Psychologist'


@admin.register(PriceChangeRequest)
class PriceChangeRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_psychologist_name', 'current_price', 'requested_price', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('psychologist__user__first_name', 'psychologist__user__last_name', 'current_price', 'requested_price')
    
    def get_psychologist_name(self, obj):
        return obj.psychologist.user.get_full_name()
    get_psychologist_name.short_description = 'Psychologist'
