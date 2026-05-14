from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        BUYER = "buyer", "Buyer"
        SELLER = "seller", "Seller"
        SUPERADMIN = "superadmin", "Superadmin"

    class SellerAccountStatus(models.TextChoices):
        NA = "na", "N/A"
        PENDING = "pending", "Pending approval"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=32, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.BUYER)
    seller_account_status = models.CharField(
        max_length=16,
        choices=SellerAccountStatus.choices,
        default=SellerAccountStatus.NA,
        db_index=True,
    )
    is_blocked = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self) -> str:
        return self.email
