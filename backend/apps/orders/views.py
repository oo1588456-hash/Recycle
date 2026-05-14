from collections import defaultdict
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cart.models import Cart, CartItem
from apps.common.permissions import IsBuyer, IsNotBlocked, IsSeller, IsSuperAdmin
from apps.orders.models import Order, OrderItem
from apps.orders.serializers import OrderSerializer
from apps.products.models import ProductListing


class CreateFromCartView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsBuyer]

    @transaction.atomic
    def post(self, request):
        cart = Cart.objects.filter(buyer=request.user).first()
        if not cart or not cart.items.exists():
            raise ValidationError("Cart is empty.")
        body = request.data
        shipping = body.get("shipping_address")
        phone = body.get("buyer_phone")
        pay = body.get("payment_method", Order.PaymentMethod.CASH_ON_DELIVERY)
        notes = body.get("notes", "")
        if not shipping or not phone:
            raise ValidationError("shipping_address and buyer_phone are required.")

        groups: dict[int, list[CartItem]] = defaultdict(list)
        for item in cart.items.select_related("product", "product__seller"):
            groups[item.product.seller_id].append(item)

        created_orders = []
        for seller_id, items in groups.items():
            total = Decimal("0")
            for it in items:
                if it.product.seller_id == request.user.id:
                    raise ValidationError("Cannot purchase your own listing.")
                total += Decimal(str(it.product.final_price)) * it.quantity
            order = Order.objects.create(
                buyer=request.user,
                seller_id=seller_id,
                order_number=Order.generate_order_number(),
                total_amount=total,
                currency=(items[0].product.currency or "").strip() or settings.DEFAULT_CURRENCY,
                status=Order.Status.PENDING,
                payment_method=pay,
                payment_status=Order.PaymentStatus.UNPAID,
                shipping_address=shipping,
                buyer_phone=phone,
                notes=notes,
            )
            for it in items:
                p = it.product
                OrderItem.objects.create(
                    order=order,
                    product=p,
                    seller_id=seller_id,
                    price=p.final_price,
                    quantity=it.quantity,
                )
                p.stock_quantity = max(0, p.stock_quantity - it.quantity)
                if p.stock_quantity == 0:
                    p.status = ProductListing.Status.SOLD
                p.save(update_fields=["stock_quantity", "status", "updated_at"])
                it.delete()
            created_orders.append(order)

        return Response(OrderSerializer(created_orders, many=True).data, status=status.HTTP_201_CREATED)


class MyOrdersView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsBuyer]

    def get(self, request):
        qs = Order.objects.filter(buyer=request.user).prefetch_related("items").order_by("-created_at")
        return Response(OrderSerializer(qs, many=True).data)


class OrderDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked]

    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        if getattr(request.user, "role", None) != "superadmin":
            if order.buyer_id != request.user.id and order.seller_id != request.user.id:
                raise PermissionDenied()
        return Response(OrderSerializer(order).data)


class SellerOrdersView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSeller]

    def get(self, request):
        qs = Order.objects.filter(seller=request.user).prefetch_related("items").order_by("-created_at")
        return Response(OrderSerializer(qs, many=True).data)


class SellerOrderStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSeller]

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk, seller=request.user)
        st = request.data.get("status")
        if st not in dict(Order.Status.choices):
            raise ValidationError("Invalid status")
        order.status = st
        order.save(update_fields=["status", "updated_at"])
        return Response(OrderSerializer(order).data)


class AdminOrdersView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSuperAdmin]

    def get(self, request):
        qs = Order.objects.all().prefetch_related("items").order_by("-created_at")[:500]
        return Response(OrderSerializer(qs, many=True).data)


class AdminOrderStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSuperAdmin]

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        st = request.data.get("status")
        if st not in dict(Order.Status.choices):
            raise ValidationError("Invalid status")
        order.status = st
        order.save(update_fields=["status", "updated_at"])
        return Response(OrderSerializer(order).data)
