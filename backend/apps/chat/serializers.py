from rest_framework import serializers

from apps.chat.models import Message
from apps.products.serializers import SellerMiniSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender = SellerMiniSerializer(read_only=True)
    receiver = SellerMiniSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ("id", "sender", "receiver", "product", "order", "message", "is_read", "created_at")
        read_only_fields = ("id", "sender", "receiver", "is_read", "created_at")


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ("receiver", "product", "order", "message")

    def create(self, validated_data):
        validated_data["sender"] = self.context["request"].user
        return super().create(validated_data)
