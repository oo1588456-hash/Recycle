from django.shortcuts import get_object_or_404
from rest_framework import permissions, serializers, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cart.models import Cart, CartItem
from apps.common.permissions import IsNotBlocked
from apps.products.models import ProductListing
from apps.products.serializers import ProductPublicSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product_detail = ProductPublicSerializer(source="product", read_only=True)

    class Meta:
        model = CartItem
        fields = ("id", "product", "product_detail", "quantity", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ("id", "items", "created_at", "updated_at")


def _get_cart(user):
    cart, _ = Cart.objects.get_or_create(buyer=user)
    return cart


class CartDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked]

    def get(self, request):
        cart = _get_cart(request.user)
        return Response(CartSerializer(cart).data)


class CartItemAddView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked]

    def post(self, request):
        pid = request.data.get("product_id")
        qty = int(request.data.get("quantity", 1))
        product = get_object_or_404(ProductListing, pk=pid)
        if product.seller_id == request.user.id:
            raise ValidationError("You cannot add your own product to cart.")
        if product.status != ProductListing.Status.ACTIVE or product.stock_quantity < 1:
            raise ValidationError("Product is not available.")
        cart = _get_cart(request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={"quantity": qty})
        if not created:
            item.quantity = qty
            item.save(update_fields=["quantity", "updated_at"])
        return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked]

    def patch(self, request, pk):
        cart = _get_cart(request.user)
        item = get_object_or_404(CartItem, pk=pk, cart=cart)
        q = int(request.data.get("quantity", item.quantity))
        if q < 1:
            raise ValidationError("Invalid quantity")
        item.quantity = q
        item.save(update_fields=["quantity", "updated_at"])
        return Response(CartItemSerializer(item).data)

    def delete(self, request, pk):
        cart = _get_cart(request.user)
        CartItem.objects.filter(pk=pk, cart=cart).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartClearView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked]

    def delete(self, request):
        cart = _get_cart(request.user)
        cart.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
