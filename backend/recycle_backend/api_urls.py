from django.urls import include, path

urlpatterns = [
    path("auth/", include("apps.accounts.urls")),
    path("categories/", include("apps.categories.urls")),
    path("products/", include("apps.products.public_urls")),
    path("seller/", include("apps.products.seller_urls")),
    path("cart/", include("apps.cart.urls")),
    path("orders/", include("apps.orders.urls")),
    path("admin/", include("apps.dashboard.admin_urls")),
    path("chat/", include("apps.chat.urls")),
    path("ai/", include("apps.ai_engine.urls")),
]
