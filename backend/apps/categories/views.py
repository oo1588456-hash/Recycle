from rest_framework import permissions, viewsets

from apps.categories.models import Category
from apps.categories.serializers import CategorySerializer
from apps.common.permissions import IsNotBlocked, IsSuperAdmin


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    pagination_class = None

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsNotBlocked(), IsSuperAdmin()]

    def get_queryset(self):
        qs = Category.objects.all()
        if self.request.method in permissions.SAFE_METHODS:
            return qs.filter(is_active=True)
        return qs
