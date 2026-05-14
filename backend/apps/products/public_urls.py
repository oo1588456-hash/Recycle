from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.products.public_views import ProductPublicViewSet

router = DefaultRouter()
router.register(r"", ProductPublicViewSet, basename="product")

urlpatterns = router.urls
