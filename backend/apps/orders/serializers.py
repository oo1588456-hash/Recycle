from rest_framework import serializers

from apps.orders.models import Order, OrderItem


class OrderItemOutSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ("id", "product", "seller", "price", "quantity", "created_at")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemOutSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "buyer",
            "seller",
            "order_number",
            "total_amount",
            "currency",
            "status",
            "payment_method",
            "payment_status",
            "shipping_address",
            "buyer_phone",
            "notes",
            "items",
            "created_at",
            "updated_at",
        )
