from django.utils.text import slugify
from rest_framework import serializers

from apps.categories.models import Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "parent", "icon", "is_active", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

    def create(self, validated_data):
        if not validated_data.get("slug"):
            validated_data["slug"] = slugify(validated_data["name"])[:140]
        return super().create(validated_data)
