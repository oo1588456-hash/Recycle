# Generated manually — ensures fresh DBs have categories for seller listings.

from django.db import migrations

_DEFAULT_ROWS: list[dict[str, str]] = [
    {
        "slug": "mobile-phones",
        "name": "Mobile Phones",
        "description": "Certified-style listings for used handsets.",
    },
    {
        "slug": "laptops",
        "name": "Laptops",
        "description": "Work-from-home ready second-hand machines.",
    },
    {
        "slug": "tablets",
        "name": "Tablets",
        "description": "Compact screens for study and travel.",
    },
    {
        "slug": "watches",
        "name": "Watches",
        "description": "Wearables and timepieces with clear condition notes.",
    },
    {
        "slug": "cameras",
        "name": "Cameras",
        "description": "Capture memories for less.",
    },
    {
        "slug": "headphones",
        "name": "Headphones",
        "description": "Audio gear with honest wear grading.",
    },
    {
        "slug": "gaming-consoles",
        "name": "Gaming Consoles",
        "description": "Play more, spend less.",
    },
    {
        "slug": "fashion",
        "name": "Fashion",
        "description": "Circular wardrobe pieces.",
    },
    {
        "slug": "shoes",
        "name": "Shoes",
        "description": "Sneakers and dress shoes, accurately described.",
    },
    {
        "slug": "furniture",
        "name": "Furniture",
        "description": "Homeware with delivery-friendly sizing.",
    },
    {
        "slug": "books",
        "name": "Books",
        "description": "Textbooks and reads in good nick.",
    },
    {
        "slug": "accessories",
        "name": "Accessories",
        "description": "Cables, cases, and everyday add-ons.",
    },
]


def seed_defaults(apps, schema_editor):
    Category = apps.get_model("categories", "Category")
    for row in _DEFAULT_ROWS:
        Category.objects.update_or_create(
            slug=row["slug"],
            defaults={
                "name": row["name"],
                "description": row["description"],
                "is_active": True,
                "parent_id": None,
            },
        )


def unseed_defaults(apps, schema_editor):
    Category = apps.get_model("categories", "Category")
    Category.objects.filter(slug__in=[r["slug"] for r in _DEFAULT_ROWS]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("categories", "0002_category_description"),
    ]

    operations = [
        migrations.RunPython(seed_defaults, unseed_defaults),
    ]
