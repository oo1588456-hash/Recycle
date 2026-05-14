"""
Seed superadmin, demo buyer/seller, categories, optional sample listing.
Run: python scripts/seed_initial_data.py (from backend/ with Django on PYTHONPATH)
"""
import os
import sys

import django

BACKEND = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "recycle_backend.settings")
django.setup()

from django.contrib.auth import get_user_model  # noqa: E402
from django.utils.text import slugify  # noqa: E402

from apps.categories.models import Category  # noqa: E402

User = get_user_model()

DEFAULT_CATEGORIES = [
    "Mobile Phones",
    "Laptops",
    "Tablets",
    "Watches",
    "Cameras",
    "Headphones",
    "Gaming Consoles",
    "Fashion",
    "Shoes",
    "Furniture",
    "Books",
    "Accessories",
    "Other",
]


def upsert_user(email: str, username: str, password: str, role: str, full_name: str, *, superuser: bool = False):
    if role == User.Role.SELLER:
        seller_status = User.SellerAccountStatus.APPROVED
    else:
        seller_status = User.SellerAccountStatus.NA
    u, created = User.objects.get_or_create(
        email=email,
        defaults={
            "username": username,
            "full_name": full_name,
            "role": role,
            "is_staff": superuser,
            "is_superuser": superuser,
            "seller_account_status": seller_status,
        },
    )
    if not created:
        u.username = username
        u.full_name = full_name
        u.role = role
        u.is_staff = superuser or u.is_staff
        u.is_superuser = superuser or u.is_superuser
        u.is_blocked = False
        u.seller_account_status = seller_status
        u.save()
    u.is_active = True
    u.set_password(password)
    u.save()
    return u


def main() -> None:
    upsert_user(
        "useradmin@recycle.com",
        "useradmin",
        "admin",
        User.Role.SUPERADMIN,
        "Platform Admin",
        superuser=True,
    )
    # Legacy demo admin — disable so JWT login and support-contact resolve to the new account.
    User.objects.filter(email="admin@recycle.com").update(is_active=False)
    upsert_user("buyer@recycle.com", "buyer1", "Buyer12345", User.Role.BUYER, "Demo Buyer")
    upsert_user("seller@recycle.com", "seller1", "Seller12345", User.Role.SELLER, "Demo Seller")
    for name in DEFAULT_CATEGORIES:
        slug = slugify(name)[:140]
        Category.objects.get_or_create(slug=slug, defaults={"name": name, "is_active": True})
    print(
        "Seed complete: superadmin useradmin@recycle.com / admin "
        "(username useradmin), buyer@recycle.com / Buyer12345, seller@recycle.com / Seller12345"
    )


if __name__ == "__main__":
    main()
