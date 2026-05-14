from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=128)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField(blank=True, default="")
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )
    icon = models.ImageField(upload_to="category_icons/", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self) -> str:
        return self.name
