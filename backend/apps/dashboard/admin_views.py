import json
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.serializers import UserSerializer
from apps.ai_engine.models import AIAnalysisResult
from apps.ai_engine.serializers import AIAnalysisResultSerializer
from apps.categories.models import Category
from apps.categories.serializers import CategorySerializer
from apps.chat.models import Message
from apps.common.permissions import IsNotBlocked, IsSuperAdmin
from apps.orders.models import Order
from apps.orders.serializers import OrderSerializer
from apps.orders.views import AdminOrderStatusView, AdminOrdersView
from apps.products.models import ProductListing
from apps.products.serializers import ProductPublicSerializer

User = get_user_model()

DEFAULT_MARKETPLACE_CATEGORIES: list[dict[str, str]] = [
    {
        "slug": "mobile-phones",
        "name": "Mobile Phones",
        "description": "Certified-style listings for used handsets.",
    },
    {
        "slug": "laptops",
        "name": "Laptops",
        "description": "Work-from-home ready second-hand machines.",
    },
    {
        "slug": "tablets",
        "name": "Tablets",
        "description": "Compact screens for study and travel.",
    },
    {
        "slug": "watches",
        "name": "Watches",
        "description": "Wearables and timepieces with clear condition notes.",
    },
    {
        "slug": "cameras",
        "name": "Cameras",
        "description": "Capture memories for less.",
    },
    {
        "slug": "headphones",
        "name": "Headphones",
        "description": "Audio gear with honest wear grading.",
    },
    {
        "slug": "gaming-consoles",
        "name": "Gaming Consoles",
        "description": "Play more, spend less.",
    },
    {
        "slug": "fashion",
        "name": "Fashion",
        "description": "Circular wardrobe pieces.",
    },
    {
        "slug": "shoes",
        "name": "Shoes",
        "description": "Sneakers and dress shoes, accurately described.",
    },
    {
        "slug": "furniture",
        "name": "Furniture",
        "description": "Homeware with delivery-friendly sizing.",
    },
    {
        "slug": "books",
        "name": "Books",
        "description": "Textbooks and reads in good nick.",
    },
    {
        "slug": "accessories",
        "name": "Accessories",
        "description": "Cables, cases, and everyday add-ons.",
    },
]


class AdminSeedDefaultCategoriesView(APIView):
    """Create or update the standard marketplace top-level categories (superadmin only)."""

    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSuperAdmin]

    def post(self, request):
        created = 0
        updated = 0
        for row in DEFAULT_MARKETPLACE_CATEGORIES:
            _obj, was_created = Category.objects.update_or_create(
                slug=row["slug"],
                defaults={
                    "name": row["name"],
                    "description": row["description"],
                    "is_active": True,
                    "parent_id": None,
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1
        slugs = [r["slug"] for r in DEFAULT_MARKETPLACE_CATEGORIES]
        qs = Category.objects.filter(slug__in=slugs).order_by("name")
        return Response(
            {
                "created": created,
                "updated": updated,
                "categories": CategorySerializer(qs, many=True).data,
            },
            status=status.HTTP_200_OK,
        )


class AdminDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSuperAdmin]

    def get(self, request):
        return Response(
            {
                "total_buyers": User.objects.filter(role=User.Role.BUYER).count(),
                "total_sellers": User.objects.filter(role=User.Role.SELLER).count(),
                "total_products": ProductListing.objects.count(),
                "active_products": ProductListing.objects.filter(status=ProductListing.Status.ACTIVE).count(),
                "sold_products": ProductListing.objects.filter(status=ProductListing.Status.SOLD).count(),
                "total_orders": Order.objects.count(),
                "pending_orders": Order.objects.filter(status=Order.Status.PENDING).count(),
                "pending_seller_accounts": User.objects.filter(
                    role=User.Role.SELLER,
                    seller_account_status=User.SellerAccountStatus.PENDING,
                ).count(),
                "total_ai_analyses": AIAnalysisResult.objects.count(),
            }
        )


class AdminUsersView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSuperAdmin]

    def get(self, request):
        qs = User.objects.all().order_by("-created_at")
        if role := request.query_params.get("role"):
            qs = qs.filter(role=role)
        if st := request.query_params.get("seller_status"):
            qs = qs.filter(seller_account_status=st)
        return Response(UserSerializer(qs[:500], many=True).data)


class AdminUserBlockView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSuperAdmin]

    def patch(self, request, pk):
        u = get_object_or_404(User, pk=pk)
        u.is_blocked = True
        u.save(update_fields=["is_blocked", "updated_at"])
        return Response(UserSerializer(u).data)


class AdminUserUnblockView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSuperAdmin]

    def patch(self, request, pk):
        u = get_object_or_404(User, pk=pk)
        u.is_blocked = False
        u.save(update_fields=["is_blocked", "updated_at"])
        return Response(UserSerializer(u).data)


class AdminUserDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSuperAdmin]

    def delete(self, request, pk):
        u = get_object_or_404(User, pk=pk)
        if u.role == User.Role.SUPERADMIN:
            return Response({"detail": "Cannot delete superadmin."}, status=status.HTTP_400_BAD_REQUEST)
        u.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminSellerStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSuperAdmin]

    def patch(self, request, pk):
        u = get_object_or_404(User, pk=pk)
        if u.role != User.Role.SELLER:
            return Response({"detail": "User is not a seller."}, status=status.HTTP_400_BAD_REQUEST)
        st = request.data.get("seller_account_status")
        if st not in (
            User.SellerAccountStatus.PENDING,
            User.SellerAccountStatus.APPROVED,
            User.SellerAccountStatus.REJECTED,
        ):
            return Response({"detail": "Invalid seller_account_status."}, status=status.HTTP_400_BAD_REQUEST)
        u.seller_account_status = st
        u.save(update_fields=["seller_account_status", "updated_at"])
        return Response(UserSerializer(u).data)


class AdminSupportInboxView(APIView):
    """Platform messages without product/order (buyer/seller ↔ superadmin)."""

    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSuperAdmin]

    def get(self, request):
        admin = request.user
        msgs = (
            Message.objects.filter(Q(sender=admin) | Q(receiver=admin))
            .filter(product__isnull=True, order__isnull=True)
            .select_related("sender", "receiver")
            .order_by("-created_at")
        )
        seen: set[int] = set()
        out: list[dict] = []
        for m in msgs:
            other_id = m.receiver_id if m.sender_id == admin.id else m.sender_id
            if other_id == admin.id or other_id in seen:
                continue
            seen.add(other_id)
            other = m.receiver if m.sender_id == admin.id else m.sender
            unread = Message.objects.filter(
                receiver=admin,
                sender_id=other_id,
                product__isnull=True,
                order__isnull=True,
                is_read=False,
            ).count()
            out.append(
                {
                    "peer": UserSerializer(other).data,
                    "product": None,
                    "last_message": m.message[:280],
                    "last_at": m.created_at,
                    "unread_count": unread,
                }
            )
        return Response(out)


class AdminProductsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSuperAdmin]

    def get(self, request):
        qs = ProductListing.objects.select_related("seller", "category").prefetch_related("images").order_by("-created_at")[
            :500
        ]
        return Response(ProductPublicSerializer(qs, many=True).data)


class AdminProductStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSuperAdmin]

    def patch(self, request, pk):
        p = get_object_or_404(ProductListing, pk=pk)
        st = request.data.get("status")
        if st not in dict(ProductListing.Status.choices):
            return Response({"detail": "Invalid status"}, status=400)
        p.status = st
        p.save(update_fields=["status", "updated_at"])
        return Response(ProductPublicSerializer(p).data)


class AdminProductDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSuperAdmin]

    def delete(self, request, pk):
        ProductListing.objects.filter(pk=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminAIAnalysesView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSuperAdmin]

    def get(self, request):
        qs = AIAnalysisResult.objects.select_related("seller", "product").order_by("-created_at")[:200]
        return Response(AIAnalysisResultSerializer(qs, many=True).data)


class AdminDatasetReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSuperAdmin]

    def get(self, request):
        backend = Path(settings.BASE_DIR)
        summary = backend / "data" / "dataset_summary.json"
        if summary.exists():
            return Response(json.loads(summary.read_text(encoding="utf-8")))
        report = backend / "docs" / "DATASETS_REPORT.md"
        if report.exists():
            return Response({"markdown": report.read_text(encoding="utf-8")})
        return Response({"detail": "Run scan_datasets first."}, status=404)
