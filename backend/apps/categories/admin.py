from django.contrib import admin

from apps.categories.models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}
    list_display = ("name", "slug", "parent", "is_active")
    search_fields = ("name", "slug", "description")
    fieldsets = (
        (None, {"fields": ("name", "slug", "parent", "is_active")}),
        ("Description", {"fields": ("description",), "classes": ("wide",)}),
        ("Media", {"fields": ("icon",), "classes": ("collapse",)}),
    )
