from django.urls import path

from apps.cart.views import CartClearView, CartDetailView, CartItemAddView, CartItemDetailView

urlpatterns = [
    path("", CartDetailView.as_view(), name="cart-detail"),
    path("items/", CartItemAddView.as_view(), name="cart-item-add"),
    path("items/<int:pk>/", CartItemDetailView.as_view(), name="cart-item-detail"),
    path("clear/", CartClearView.as_view(), name="cart-clear"),
]
