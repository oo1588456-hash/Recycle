from django.contrib import admin

from .models import AIAnalysisResult


@admin.register(AIAnalysisResult)
class AIAnalysisResultAdmin(admin.ModelAdmin):
    list_display = ("seller", "input_title", "predicted_condition_label", "success", "created_at")
    search_fields = ("input_title", "input_brand")
