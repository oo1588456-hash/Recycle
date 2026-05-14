from django.conf import settings
from django.db import models


class AIAnalysisResult(models.Model):
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_analyses",
    )
    product = models.ForeignKey(
        "products.ProductListing",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ai_results",
    )
    input_title = models.CharField(max_length=255, blank=True)
    input_description = models.TextField(blank=True)
    input_category = models.CharField(max_length=255, blank=True)
    input_brand = models.CharField(max_length=255, blank=True)
    input_model_name = models.CharField(max_length=255, blank=True)
    input_original_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    input_age_months = models.PositiveIntegerField(null=True, blank=True)
    input_usage_duration_months = models.PositiveIntegerField(null=True, blank=True)
    input_user_condition = models.CharField(max_length=32, blank=True)
    image_used = models.ImageField(upload_to="ai_inputs/", blank=True, null=True)
    gemini_model_name = models.CharField(max_length=128, blank=True)
    gemini_prompt = models.TextField(blank=True)
    gemini_raw_response = models.JSONField(default=dict, blank=True)
    predicted_condition_label = models.CharField(max_length=32, blank=True)
    predicted_condition_score = models.PositiveSmallIntegerField(null=True, blank=True)
    suggested_price_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    suggested_price_avg = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    suggested_price_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    explanation = models.TextField(blank=True)
    confidence_score = models.PositiveSmallIntegerField(null=True, blank=True)
    warnings = models.JSONField(null=True, blank=True)
    latency_ms = models.PositiveIntegerField(null=True, blank=True)
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
