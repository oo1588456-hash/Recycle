from django.urls import path

from apps.orders.views import CreateFromCartView, MyOrdersView, OrderDetailView

urlpatterns = [
    path("create-from-cart/", CreateFromCartView.as_view(), name="order-create-from-cart"),
    path("my-orders/", MyOrdersView.as_view(), name="order-my-list"),
    path("<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
]
