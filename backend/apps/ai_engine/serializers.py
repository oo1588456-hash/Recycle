from decimal import Decimal

from rest_framework import serializers

from apps.ai_engine.models import AIAnalysisResult


class AIAnalysisResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAnalysisResult
        fields = (
            "id",
            "seller",
            "product",
            "input_title",
            "input_description",
            "input_category",
            "input_brand",
            "input_model_name",
            "input_original_price",
            "input_age_months",
            "input_usage_duration_months",
            "input_user_condition",
            "gemini_model_name",
            "predicted_condition_label",
            "predicted_condition_score",
            "suggested_price_min",
            "suggested_price_avg",
            "suggested_price_max",
            "explanation",
            "confidence_score",
            "warnings",
            "latency_ms",
            "success",
            "error_message",
            "created_at",
        )
        read_only_fields = fields
