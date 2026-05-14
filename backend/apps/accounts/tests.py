from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.categories.models import Category
from apps.products.models import ProductListing

User = get_user_model()


class AuthProductFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cat = Category.objects.create(name="Phones", slug="phones")

    def test_register_login_create_seller_product(self):
        r = self.client.post(
            "/api/v1/auth/register/",
            {
                "email": "t1@example.com",
                "username": "t1",
                "full_name": "T One",
                "password": "Password123!",
                "role": "seller",
            },
            format="json",
        )
        self.assertIn(r.status_code, (200, 201))
        r = self.client.post(
            "/api/v1/auth/login/",
            {"email": "t1@example.com", "password": "Password123!"},
            format="json",
        )
        self.assertEqual(r.status_code, 200)
        access = r.json()["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        r = self.client.post(
            "/api/v1/seller/products/",
            {
                "title": "Phone",
                "description": "d",
                "category": self.cat.id,
                "brand": "b",
                "original_price": "1000.00",
                "final_price": "1000.00",
                "currency": "GBP",
                "user_declared_condition": "good",
                "status": "draft",
            },
            format="json",
        )
        self.assertEqual(r.status_code, 403)
        User.objects.filter(email="t1@example.com").update(seller_account_status=User.SellerAccountStatus.APPROVED)
        r = self.client.post(
            "/api/v1/seller/products/",
            {
                "title": "Phone",
                "description": "d",
                "category": self.cat.id,
                "brand": "b",
                "original_price": "1000.00",
                "final_price": "1000.00",
                "currency": "GBP",
                "user_declared_condition": "good",
                "status": "draft",
            },
            format="json",
        )
        self.assertEqual(r.status_code, 201)
        self.assertIn("id", r.json())
