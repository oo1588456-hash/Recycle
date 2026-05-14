from django.contrib.auth import get_user_model
from django.db.models import F, Q
from rest_framework import permissions, viewsets

from apps.products.models import ProductListing
from apps.products.serializers import ProductPublicSerializer

User = get_user_model()


class ProductPublicViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductPublicSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = (
            ProductListing.objects.filter(status=ProductListing.Status.ACTIVE, stock_quantity__gt=0)
            .select_related("seller", "category")
            .prefetch_related("images")
            .filter(
                seller__is_blocked=False,
                seller__is_active=True,
                seller__seller_account_status=User.SellerAccountStatus.APPROVED,
            )
        )
        p = self.request.query_params
        if s := p.get("search"):
            qs = qs.filter(Q(title__icontains=s) | Q(description__icontains=s))
        if c := p.get("category"):
            qs = qs.filter(category_id=c)
        if mp := p.get("min_price"):
            qs = qs.filter(final_price__gte=mp)
        if xp := p.get("max_price"):
            qs = qs.filter(final_price__lte=xp)
        if cd := p.get("condition"):
            qs = qs.filter(user_declared_condition=cd)
        if br := p.get("brand"):
            qs = qs.filter(brand__icontains=br)
        if sl := p.get("seller"):
            qs = qs.filter(seller_id=sl)
        if loc := p.get("location"):
            qs = qs.filter(location__icontains=loc)
        return qs.order_by("-created_at")

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        ProductListing.objects.filter(pk=obj.pk).update(views_count=F("views_count") + 1)
        return super().retrieve(request, *args, **kwargs)
