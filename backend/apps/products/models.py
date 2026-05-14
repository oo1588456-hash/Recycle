from django.db import models


class ProductListing(models.Model):
    class Condition(models.TextChoices):
        EXCELLENT = "excellent", "Excellent"
        GOOD = "good", "Good"
        FAIR = "fair", "Fair"
        POOR = "poor", "Poor"

    class AICondition(models.TextChoices):
        EXCELLENT = "excellent", "Excellent"
        GOOD = "good", "Good"
        FAIR = "fair", "Fair"
        POOR = "poor", "Poor"
        UNKNOWN = "unknown", "Unknown"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING_REVIEW = "pending_review", "Pending review"
        ACTIVE = "active", "Active"
        SOLD = "sold", "Sold"
        REJECTED = "rejected", "Rejected"
        ARCHIVED = "archived", "Archived"

    seller = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="listings",
    )
    category = models.ForeignKey(
        "categories.Category",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    brand = models.CharField(max_length=128, blank=True)
    model_name = models.CharField(max_length=128, blank=True)
    storage = models.CharField(max_length=64, blank=True)
    ram = models.CharField(max_length=64, blank=True)
    processor = models.CharField(max_length=128, blank=True)
    battery_health = models.CharField(max_length=64, blank=True)
    screen_condition = models.CharField(max_length=64, blank=True)
    body_condition = models.CharField(max_length=64, blank=True)
    warranty_status = models.CharField(max_length=128, blank=True)
    accessories_included = models.TextField(blank=True)
    box_available = models.BooleanField(default=False)

    original_price = models.DecimalField(max_digits=12, decimal_places=2)
    final_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=8, default="GBP")
    product_age_months = models.PositiveIntegerField(null=True, blank=True)
    usage_duration_months = models.PositiveIntegerField(null=True, blank=True)
    user_declared_condition = models.CharField(
        max_length=16,
        choices=Condition.choices,
        default=Condition.GOOD,
    )

    ai_condition_label = models.CharField(
        max_length=16,
        choices=AICondition.choices,
        default=AICondition.UNKNOWN,
    )
    ai_condition_score = models.PositiveSmallIntegerField(null=True, blank=True)
    ai_suggested_price_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    ai_suggested_price_avg = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    ai_suggested_price_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    ai_price_explanation = models.TextField(blank=True, null=True)
    ai_confidence_score = models.PositiveSmallIntegerField(null=True, blank=True)
    ai_warnings = models.JSONField(null=True, blank=True)
    is_ai_evaluated = models.BooleanField(default=False)
    ai_evaluated_at = models.DateTimeField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    stock_quantity = models.PositiveIntegerField(default=1)
    location = models.CharField(max_length=255, blank=True)
    views_count = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.title


class ProductImage(models.Model):
    product = models.ForeignKey(
        ProductListing,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(upload_to="products/")
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_primary", "uploaded_at"]
