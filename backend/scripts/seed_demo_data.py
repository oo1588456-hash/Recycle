"""
Seed default categories. Run from backend/:
python scripts/seed_demo_data.py
"""
import os
import sys

import django

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "recycle_backend.settings")
django.setup()

from django.utils.text import slugify  # noqa: E402

from apps.products.models import Category  # noqa: E402

DEFAULT_CATEGORIES = [
    "Electronics",
    "Fashion",
    "Shoes",
    "Phones",
    "Laptops",
    "Watches",
    "Furniture",
    "Accessories",
    "Books",
    "Other",
]


def main() -> None:
    for name in DEFAULT_CATEGORIES:
        slug = slugify(name)[:140]
        obj, created = Category.objects.get_or_create(slug=slug, defaults={"name": name})
        if not created and obj.name != name:
            obj.name = name
            obj.save(update_fields=["name", "updated_at"])
        print(("+" if created else "="), name)


if __name__ == "__main__":
    main()
