"""
Build normalized price baseline from local datasets into backend/data/price_baseline.csv
Run from backend/: python scripts/build_price_baseline.py
"""
from __future__ import annotations

import os
import warnings
from pathlib import Path

import pandas as pd

BACKEND_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BACKEND_DIR.parent
DATASETS = Path(os.environ.get("DATASETS_DIR", REPO_ROOT / "datasets"))
OUT = BACKEND_DIR / "data" / "price_baseline.csv"


def _append(rows: list[dict], source: str, df: pd.DataFrame, mapping: dict) -> None:
    for _, r in df.iterrows():
        try:
            row: dict = {"source_dataset": source}
            for out_col, src in mapping.items():
                if callable(src):
                    row[out_col] = src(r)
                elif src in r.index:
                    row[out_col] = r[src]
                else:
                    row[out_col] = None
            rows.append(row)
        except Exception:  # noqa: BLE001
            continue


def load_mercari_train() -> pd.DataFrame | None:
    p = DATASETS / "mercari_price_suggestion" / "train.tsv"
    if not p.exists():
        return None
    return pd.read_csv(p, sep="\t", on_bad_lines="skip", engine="python", nrows=50000)


def load_fashion_styles() -> pd.DataFrame | None:
    p = DATASETS / "fashion_product_images_small" / "styles.csv"
    if not p.exists():
        warnings.warn(f"Missing fashion styles: {p}")
        return None
    return pd.read_csv(p, nrows=20000, on_bad_lines="skip", engine="python")


def load_branded_bottoms() -> pd.DataFrame | None:
    p = DATASETS / "branded_bottoms_resale" / "updated_dataset.csv"
    if not p.exists():
        return None
    return pd.read_csv(p, nrows=20000, on_bad_lines="skip", engine="python")


def load_combined_ecommerce() -> pd.DataFrame | None:
    p = DATASETS / "ecommerce_products_sizes" / "Combined_dataset.csv"
    if not p.exists():
        return None
    return pd.read_csv(p, nrows=30000, on_bad_lines="skip", engine="python")


def load_electronics_pricing() -> pd.DataFrame | None:
    p = DATASETS / "electronics_product_pricing" / "electronics_products_pricing.csv"
    if not p.exists():
        return None
    return pd.read_csv(p, nrows=30000, on_bad_lines="skip", engine="python")


def load_datafiniti() -> pd.DataFrame | None:
    p = DATASETS / "datafiniti_electronic_products" / "DatafinitiElectronicsProductsPricingData.csv"
    if not p.exists():
        return None
    return pd.read_csv(p, nrows=20000, on_bad_lines="skip", engine="python")


def load_reselling() -> pd.DataFrame | None:
    p = DATASETS / "reselling_items_ecommerce" / "Re-selling items.csv"
    if not p.exists():
        return None
    return pd.read_csv(p, nrows=5000, on_bad_lines="skip", engine="python")


def load_tech_dataset() -> pd.DataFrame | None:
    p = DATASETS / "ecommerce_tech_dataset" / "Ecommerce Dataset v2.csv"
    if not p.exists():
        alt = DATASETS / "ecommerce_tech_dataset" / "Dataset(Shophive HomeShopping PriceOye).csv"
        if alt.exists():
            return pd.read_csv(alt, nrows=20000, on_bad_lines="skip", engine="python")
        return None
    return pd.read_csv(p, nrows=20000, on_bad_lines="skip", engine="python")


def main() -> None:
    rows: list[dict] = []

    m = load_mercari_train()
    if m is not None and "name" in m.columns:
        desc_col = "item_description" if "item_description" in m.columns else None

        def _desc(r):
            return r.get(desc_col, "") if desc_col else ""

        _append(
            rows,
            "mercari_price_suggestion",
            m,
            {
                "title": "name",
                "category": "category_name",
                "brand": "brand_name",
                "price": "price",
                "currency": lambda r: "USD",
                "description": _desc,
            },
        )

    f = load_fashion_styles()
    if f is not None:

        def _cat(r):
            parts = [r.get("masterCategory"), r.get("subCategory"), r.get("articleType")]
            return " / ".join(str(p) for p in parts if pd.notna(p))

        _append(
            rows,
            "fashion_product_images_small",
            f,
            {
                "title": "productDisplayName",
                "category": lambda r: _cat(r),
                "brand": lambda r: "",
                "price": lambda r: None,
                "currency": lambda r: "GBP",
                "description": lambda r: "",
            },
        )

    b = load_branded_bottoms()
    if b is not None:
        _append(
            rows,
            "branded_bottoms_resale",
            b,
            {
                "title": "title",
                "category": "category",
                "brand": "brand",
                "price": "price",
                "currency": lambda r: "USD",
                "description": lambda r: str(r.get("hashtags", "")),
            },
        )

    c = load_combined_ecommerce()
    if c is not None:
        _append(
            rows,
            "ecommerce_products_sizes",
            c,
            {
                "title": "title",
                "category": "category",
                "brand": lambda r: "",
                "price": "final_price",
                "currency": "currency",
                "description": "product_description",
            },
        )

    e = load_electronics_pricing()
    if e is not None:
        _append(
            rows,
            "electronics_product_pricing",
            e,
            {
                "title": "name",
                "category": "primaryCategories",
                "brand": "brand",
                "price": "price",
                "currency": lambda r: str(r.get("prices.currency", "USD")),
                "description": lambda r: str(r.get("categories", "")),
            },
        )

    d = load_datafiniti()
    if d is not None:

        def _price(r):
            mx = r.get("prices.amountMax")
            mn = r.get("prices.amountMin")
            try:
                if pd.notna(mx) and pd.notna(mn):
                    return (float(mx) + float(mn)) / 2
                if pd.notna(mx):
                    return float(mx)
                if pd.notna(mn):
                    return float(mn)
            except Exception:  # noqa: BLE001
                return None
            return None

        _append(
            rows,
            "datafiniti_electronic_products",
            d,
            {
                "title": "name",
                "category": "primaryCategories",
                "brand": "brand",
                "price": lambda r: _price(r),
                "currency": lambda r: str(r.get("prices.currency", "USD")),
                "description": lambda r: str(r.get("categories", "")),
            },
        )

    rcsv = load_reselling()
    if rcsv is not None:
        _append(
            rows,
            "reselling_items_ecommerce",
            rcsv,
            {
                "title": "Product_name",
                "category": lambda r: "general",
                "brand": lambda r: "",
                "price": "Price",
                "currency": lambda r: "GBP",
                "description": "Address",
            },
        )

    t = load_tech_dataset()
    if t is not None:
        # best-effort column detection
        cols = {c.lower(): c for c in t.columns}

        def pick(*names):
            for n in names:
                for k, v in cols.items():
                    if n in k.replace(" ", ""):
                        return v
            return None

        title_c = pick("name", "title", "product")
        price_c = pick("price", "amount", "cost")
        brand_c = pick("brand")
        cat_c = pick("category", "type")
        if title_c and price_c:

            def _cat_val(rr, c=cat_c):
                return rr[c] if c and c in rr.index else ""

            def _brand_val(rr, b=brand_c):
                return rr[b] if b and b in rr.index else ""

            _append(
                rows,
                "ecommerce_tech_dataset",
                t,
                {
                    "title": title_c,
                    "category": _cat_val,
                    "brand": _brand_val,
                    "price": price_c,
                    "currency": lambda r: "GBP",
                    "description": lambda r: "",
                },
            )

    if not rows:
        warnings.warn("No rows collected; price_baseline.csv will be empty placeholder.")
    out_df = pd.DataFrame(rows)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    out_df.to_csv(OUT, index=False)
    print(f"Wrote {len(out_df)} rows to {OUT}")


if __name__ == "__main__":
    main()
