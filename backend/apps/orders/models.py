import uuid

from django.conf import settings
from django.db import models


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        PROCESSING = "processing", "Processing"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    class PaymentMethod(models.TextChoices):
        CASH_ON_DELIVERY = "cash_on_delivery", "Cash on delivery"
        BANK_TRANSFER = "bank_transfer", "Bank transfer"
        MOCK_PAYMENT = "mock_payment", "Mock payment"

    class PaymentStatus(models.TextChoices):
        UNPAID = "unpaid", "Unpaid"
        PAID = "paid", "Paid"
        REFUNDED = "refunded", "Refunded"

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="buyer_orders",
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="seller_orders",
    )
    order_number = models.CharField(max_length=40, unique=True, db_index=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=8, default="GBP")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    payment_method = models.CharField(max_length=32, choices=PaymentMethod.choices, default=PaymentMethod.CASH_ON_DELIVERY)
    payment_status = models.CharField(max_length=16, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)
    shipping_address = models.TextField()
    buyer_phone = models.CharField(max_length=32)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @staticmethod
    def generate_order_number() -> str:
        return uuid.uuid4().hex


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        "products.ProductListing",
        on_delete=models.PROTECT,
        related_name="order_items",
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="order_item_rows",
    )
    price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
