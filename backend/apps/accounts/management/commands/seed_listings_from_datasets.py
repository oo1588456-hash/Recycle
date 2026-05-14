"""
Create active listings with ProductImage rows from public dataset image URLs.

Usage (from backend/):
  python manage.py seed_listings_from_datasets --limit=30 --pause=0.2

Requires: requests, pandas (already in requirements), DATASETS_DIR, default categories
(``python scripts/seed_demo_data.py``).
"""
from __future__ import annotations

import re
import time
from decimal import Decimal
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import pandas as pd
import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from apps.accounts.models import User
from apps.categories.models import Category
from apps.products.models import ProductImage, ProductListing

SELLER_EMAIL = "dataset.seed.seller@recycle.local"
USER_AGENT = "ReCycleDatasetSeed/1.0 (+https://github.com)"


def _stem_to_slug(stem: str) -> str:
    s = stem.lower().replace("_", "--").replace("--", "-")
    if "laptop" in s or s == "laptops":
        return "laptops"
    if "phone" in s or "mobile" in s:
        return "phones"
    if "watch" in s:
        return "watches"
    if "headphone" in s or "earbud" in s or "headset" in s:
        return "accessories"
    if "shoe" in s or "sandal" in s or "heel" in s or "sneaker" in s or "runner" in s or "flat" in s:
        return "shoes"
    if "furniture" in s or "chair" in s or "table" in s or "curtain" in s:
        return "furniture"
    if "book" in s:
        return "books"
    return "fashion"


def _tech_category_slug(raw: str) -> str:
    t = (raw or "").lower()
    if "watch" in t:
        return "watches"
    if "laptop" in t or "notebook" in t:
        return "laptops"
    if "phone" in t or "mobile" in t or "tablet" in t:
        return "phones"
    if "headphone" in t or "earbud" in t:
        return "accessories"
    return "electronics"


def _parse_price(val: Any) -> Decimal:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return Decimal("99.99")
    s = str(val).strip()
    nums = re.findall(r"[\d,]+\.?\d*", s.replace(",", ""))
    if not nums:
        return Decimal("99.99")
    try:
        d = Decimal(nums[0].replace(",", ""))
        if d > 100000:
            d = d / 100
        return max(Decimal("1"), d.quantize(Decimal("0.01")))
    except Exception:  # noqa: BLE001
        return Decimal("99.99")


def _first_image_url(row: dict[str, Any], columns: set[str]) -> str | None:
    if "images" in columns and row.get("images"):
        raw = str(row["images"]).strip()
        if raw:
            return raw.split(",")[0].strip().strip('"')
    if "product_image" in columns and row.get("product_image"):
        return str(row["product_image"]).strip()
    return None


def _guess_ext(url: str, content_type: str | None) -> str:
    path = urlparse(url).path.lower()
    for ext in (".webp", ".png", ".jpg", ".jpeg", ".gif"):
        if path.endswith(ext):
            return ext.lstrip(".")
    if content_type:
        if "png" in content_type:
            return "png"
        if "webp" in content_type:
            return "webp"
        if "gif" in content_type:
            return "gif"
    return "jpg"


class Command(BaseCommand):
    help = "Seed ProductListing + ProductImage from ecommerce CSVs under DATASETS_DIR."

    def add_arguments(self, parser) -> None:
        parser.add_argument("--limit", type=int, default=40, help="Max listings to create.")
        parser.add_argument("--pause", type=float, default=0.15, help="Seconds between HTTP image downloads.")

    def handle(self, *args, **options):
        limit: int = options["limit"]
        pause: float = options["pause"]
        root: Path = settings.DATASETS_DIR
        sizes = root / "ecommerce_products_sizes"
        tech = root / "ecommerce_tech_dataset"

        seller, _ = User.objects.get_or_create(
            email=SELLER_EMAIL,
            defaults={
                "username": "dataset_seed_seller",
                "role": User.Role.SELLER,
                "seller_account_status": User.SellerAccountStatus.APPROVED,
                "is_email_verified": True,
            },
        )
        if seller.role != User.Role.SELLER:
            seller.role = User.Role.SELLER
            seller.save(update_fields=["role", "updated_at"])
        if seller.seller_account_status != User.SellerAccountStatus.APPROVED:
            seller.seller_account_status = User.SellerAccountStatus.APPROVED
            seller.save(update_fields=["seller_account_status", "updated_at"])

        cats = {c.slug: c for c in Category.objects.all()}
        if not cats:
            self.stderr.write("No categories in DB. Run: python scripts/seed_demo_data.py")
            return

        created = 0
        session = requests.Session()
        session.headers.update({"User-Agent": USER_AGENT})

        def download(url: str) -> tuple[ContentFile | None, str]:
            try:
                r = session.get(url, timeout=45, stream=True)
                r.raise_for_status()
                ext = _guess_ext(url, r.headers.get("Content-Type"))
                data = r.content
                if not data or len(data) < 500:
                    return None, ext
                name = f"seed_{abs(hash(url)) % (10**9)}.{ext}"
                return ContentFile(data, name=name), ext
            except Exception as exc:  # noqa: BLE001
                self.stderr.write(f"  skip image: {exc}")
                return None, "jpg"

        def add_row(row: dict[str, Any], columns: set[str], category_slug: str) -> bool:
            nonlocal created
            if created >= limit:
                return False
            url = _first_image_url(row, columns)
            if not url or not url.startswith("http"):
                return True
            cat = cats.get(category_slug) or cats.get("other")
            if not cat:
                return True

            title = str(row.get("title") or row.get("product_name") or "Listing")[:250]
            brand = str(row.get("brand") or row.get("product_store") or "")[:120]
            desc = str(row.get("product_description") or row.get("description") or "")[:4000]
            price = _parse_price(
                row.get("final_price") or row.get("initial_price") or row.get("product_price")
            )

            unique_title = title
            n = 0
            while ProductListing.objects.filter(seller=seller, title=unique_title).exists():
                n += 1
                unique_title = f"{title[:220]} ({n})"

            cf, _ext = download(url)
            if cf is None:
                time.sleep(pause)
                return True

            listing = ProductListing.objects.create(
                seller=seller,
                category=cat,
                title=unique_title,
                description=desc,
                brand=brand,
                model_name="",
                original_price=price,
                final_price=price,
                currency=getattr(settings, "DEFAULT_CURRENCY", "GBP"),
                product_age_months=12,
                usage_duration_months=6,
                user_declared_condition=ProductListing.Condition.GOOD,
                status=ProductListing.Status.ACTIVE,
                stock_quantity=1,
                location="UK (dataset demo)",
            )
            ProductImage.objects.create(product=listing, image=cf, is_primary=True)
            created += 1
            self.stdout.write(self.style.SUCCESS(f"+ {created}: {unique_title[:60]}…"))
            time.sleep(pause)
            return True

        if sizes.is_dir():
            for csv_path in sorted(sizes.glob("*.csv")):
                if created >= limit:
                    break
                stem_slug = _stem_to_slug(csv_path.stem)
                try:
                    df = pd.read_csv(csv_path, nrows=min(200, limit * 5))
                except Exception as exc:  # noqa: BLE001
                    self.stderr.write(f"skip {csv_path.name}: {exc}")
                    continue
                df.columns = [str(c).strip().lower() for c in df.columns]
                columns = set(df.columns)
                for _, ser in df.iterrows():
                    if created >= limit:
                        break
                    row = ser.to_dict()
                    if "title" not in row and "product_name" not in row:
                        continue
                    add_row(row, columns, stem_slug)

        tech_csv = tech / "Ecommerce Dataset v2.csv"
        if created < limit and tech_csv.is_file():
            try:
                df = pd.read_csv(tech_csv, nrows=min(300, limit * 8))
            except Exception as exc:  # noqa: BLE001
                self.stderr.write(f"skip tech csv: {exc}")
            else:
                df.columns = [str(c).lower() for c in df.columns]
                columns = set(df.columns)
                for _, ser in df.iterrows():
                    if created >= limit:
                        break
                    row = ser.to_dict()
                    slug = _tech_category_slug(str(row.get("product_category") or ""))
                    add_row(row, columns, slug)

        self.stdout.write(self.style.NOTICE(f"Done. Created {created} listings for {SELLER_EMAIL}."))
