from pathlib import Path

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.ai_engine.services.price_analysis_service import analyze_listing
from apps.common.permissions import IsNotBlocked, IsSeller, IsSellerOwner
from apps.products.models import ProductImage, ProductListing
from apps.products.serializers import ProductImageSerializer, SellerProductSerializer


class SellerProductViewSet(viewsets.ModelViewSet):
    serializer_class = SellerProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSeller]

    def get_queryset(self):
        return (
            ProductListing.objects.filter(seller=self.request.user)
            .select_related("category")
            .prefetch_related("images")
            .order_by("-created_at")
        )

    def get_permissions(self):
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsNotBlocked(), IsSeller(), IsSellerOwner()]
        return [permissions.IsAuthenticated(), IsNotBlocked(), IsSeller()]

    @action(detail=True, methods=["post"], url_path="upload-image")
    def upload_image(self, request, pk=None):
        product = self.get_object()
        ser = ProductImageSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        if ser.validated_data.get("is_primary"):
            ProductImage.objects.filter(product=product).update(is_primary=False)
        img = ProductImage.objects.create(
            product=product,
            image=ser.validated_data["image"],
            is_primary=ser.validated_data.get("is_primary", False),
        )
        return Response(ProductImageSerializer(img).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="analyze-with-ai")
    def analyze_with_ai(self, request, pk=None):
        product = self.get_object()
        result = analyze_listing(product=product, seller=request.user, image_path=None)
        return Response(result)

    @action(detail=True, methods=["post"], url_path="accept-ai-price")
    def accept_ai_price(self, request, pk=None):
        product = self.get_object()
        if not product.ai_suggested_price_avg:
            return Response({"detail": "No AI average price."}, status=status.HTTP_400_BAD_REQUEST)
        product.final_price = product.ai_suggested_price_avg
        product.save(update_fields=["final_price", "updated_at"])
        return Response(SellerProductSerializer(product).data)

    @action(detail=True, methods=["post"], url_path="publish")
    def publish(self, request, pk=None):
        product = self.get_object()
        product.status = ProductListing.Status.ACTIVE
        product.save(update_fields=["status", "updated_at"])
        return Response(SellerProductSerializer(product).data)

    @action(detail=True, methods=["post"], url_path="archive")
    def archive(self, request, pk=None):
        product = self.get_object()
        product.status = ProductListing.Status.ARCHIVED
        product.save(update_fields=["status", "updated_at"])
        return Response(SellerProductSerializer(product).data)
