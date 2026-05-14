"""
Full API smoke test. Requires backend: python manage.py runserver 8005
Optional: GEMINI_API_KEY for AI step (otherwise fallback runs).
"""
from __future__ import annotations

import io
import os
import sys

import requests
from PIL import Image as PILImage

BASE = "http://localhost:8005/api/v1"


def _reg_login(email: str, username: str, full_name: str, password: str, role: str) -> tuple[str, dict]:
    requests.post(
        f"{BASE}/auth/register/",
        json={
            "email": email,
            "username": username,
            "full_name": full_name,
            "password": password,
            "role": role,
        },
        timeout=30,
    )
    r = requests.post(f"{BASE}/auth/login/", json={"email": email, "password": password}, timeout=30)
    r.raise_for_status()
    body = r.json()
    return body["access"], body["user"]


def main() -> int:
    # 1–2 register buyer + seller (ignore if exists)
    _reg_login("flow_buyer2@example.com", "fb2", "FB", "Password123!", "buyer")
    token_s, seller = _reg_login("flow_seller2@example.com", "fs2", "FS", "Password123!", "seller")
    hs = {"Authorization": f"Bearer {token_s}"}

    r = requests.get(f"{BASE}/categories/", timeout=30)
    r.raise_for_status()
    cats = r.json().get("results", r.json())
    cid = cats[0]["id"] if cats else None

    r = requests.post(
        f"{BASE}/seller/products/",
        json={
            "title": "Test Phone",
            "description": "Used",
            "category": cid,
            "brand": "X",
            "original_price": "40000",
            "final_price": "40000",
            "currency": "GBP",
            "user_declared_condition": "good",
            "status": "draft",
        },
        headers=hs,
        timeout=30,
    )
    if r.status_code not in (200, 201):
        print("create product", r.status_code, r.text)
        return 1
    pid = r.json()["id"]

    buf = io.BytesIO()
    PILImage.new("RGB", (64, 64), color=(40, 160, 80)).save(buf, format="PNG")
    buf.seek(0)
    r = requests.post(
        f"{BASE}/seller/products/{pid}/upload-image/",
        headers=hs,
        files={"image": ("t.png", buf, "image/png")},
        data={"is_primary": "true"},
        timeout=60,
    )
    if r.status_code not in (200, 201):
        print("upload", r.status_code, r.text)
        return 1

    r = requests.post(f"{BASE}/seller/products/{pid}/analyze-with-ai/", headers=hs, timeout=120)
    if r.status_code != 200:
        print("ai", r.status_code, r.text)
        return 1

    r = requests.post(f"{BASE}/seller/products/{pid}/accept-ai-price/", headers=hs, timeout=30)
    if r.status_code != 200:
        print("accept ai", r.status_code, r.text)
        return 1

    r = requests.post(f"{BASE}/seller/products/{pid}/publish/", headers=hs, timeout=30)
    if r.status_code != 200:
        print("publish", r.status_code, r.text)
        return 1

    token_b, buyer = _reg_login("flow_buyer2@example.com", "fb2", "FB", "Password123!", "buyer")
    hb = {"Authorization": f"Bearer {token_b}"}

    r = requests.get(f"{BASE}/products/", timeout=30)
    if r.status_code != 200:
        print("list products", r.status_code, r.text)
        return 1

    r = requests.post(f"{BASE}/cart/items/", headers=hb, json={"product_id": pid, "quantity": 1}, timeout=30)
    if r.status_code not in (200, 201):
        print("cart add", r.status_code, r.text)
        return 1

    r = requests.post(
        f"{BASE}/orders/create-from-cart/",
        headers=hb,
        json={
            "shipping_address": "Test City",
            "buyer_phone": "+920000000000",
            "payment_method": "cash_on_delivery",
        },
        timeout=30,
    )
    if r.status_code not in (200, 201):
        print("order", r.status_code, r.text)
        return 1

    r = requests.post(
        f"{BASE}/chat/messages/",
        headers=hb,
        json={"receiver": seller["id"], "product": pid, "message": "Hello"},
        timeout=30,
    )
    if r.status_code not in (200, 201):
        print("chat", r.status_code, r.text)
        return 1

    r = requests.post(
        f"{BASE}/auth/login/",
        json={"email": "useradmin@recycle.com", "password": "admin"},
        timeout=30,
    )
    if r.status_code != 200:
        print("admin login", r.status_code, r.text)
        return 1
    ha = {"Authorization": f"Bearer {r.json()['access']}"}
    r = requests.get(f"{BASE}/admin/dashboard/stats/", headers=ha, timeout=30)
    if r.status_code != 200:
        print("admin stats", r.status_code, r.text)
        return 1

    print("OK flow:", r.json())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
