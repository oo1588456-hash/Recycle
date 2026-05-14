from django.contrib import admin

from apps.products.models import ProductImage, ProductListing


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0


@admin.register(ProductListing)
class ProductListingAdmin(admin.ModelAdmin):
    list_display = ("title", "seller", "status", "final_price", "currency", "created_at")
    list_filter = ("status", "currency")
    search_fields = ("title", "description", "brand")
    inlines = [ProductImageInline]
