from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework import serializers

from apps.categories.serializers import CategorySerializer
from apps.products.models import ProductImage, ProductListing

User = get_user_model()


class SellerMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "full_name")


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "is_primary", "uploaded_at")
        read_only_fields = ("id", "uploaded_at")


class ProductPublicSerializer(serializers.ModelSerializer):
    seller = SellerMiniSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = ProductListing
        fields = (
            "id",
            "seller",
            "category",
            "title",
            "description",
            "brand",
            "model_name",
            "storage",
            "ram",
            "processor",
            "battery_health",
            "screen_condition",
            "body_condition",
            "warranty_status",
            "accessories_included",
            "box_available",
            "original_price",
            "final_price",
            "currency",
            "product_age_months",
            "usage_duration_months",
            "user_declared_condition",
            "ai_condition_label",
            "ai_condition_score",
            "ai_suggested_price_min",
            "ai_suggested_price_avg",
            "ai_suggested_price_max",
            "ai_price_explanation",
            "ai_confidence_score",
            "ai_warnings",
            "is_ai_evaluated",
            "status",
            "stock_quantity",
            "location",
            "views_count",
            "is_featured",
            "images",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class SellerProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = ProductListing
        fields = (
            "id",
            "category",
            "title",
            "description",
            "brand",
            "model_name",
            "storage",
            "ram",
            "processor",
            "battery_health",
            "screen_condition",
            "body_condition",
            "warranty_status",
            "accessories_included",
            "box_available",
            "original_price",
            "final_price",
            "currency",
            "product_age_months",
            "usage_duration_months",
            "user_declared_condition",
            "status",
            "stock_quantity",
            "location",
            "is_featured",
            "images",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "seller", "images", "created_at", "updated_at")

    def create(self, validated_data):
        validated_data["seller"] = self.context["request"].user
        if validated_data.get("final_price") is None:
            validated_data["final_price"] = validated_data.get("original_price")
        if not validated_data.get("currency"):
            validated_data["currency"] = settings.DEFAULT_CURRENCY
        return super().create(validated_data)
