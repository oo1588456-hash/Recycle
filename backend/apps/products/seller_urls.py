from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.orders.views import SellerOrderStatusView, SellerOrdersView
from apps.products.seller_views import SellerProductViewSet

router = DefaultRouter()
router.register(r"products", SellerProductViewSet, basename="seller-product")

urlpatterns = router.urls + [
    path("orders/", SellerOrdersView.as_view()),
    path("orders/<int:pk>/status/", SellerOrderStatusView.as_view()),
]
