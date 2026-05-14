from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.core.exceptions import PermissionDenied
from django.http import Http404, HttpResponseNotAllowed, HttpResponseRedirect
from django.urls import path, reverse
from django.utils.translation import gettext_lazy as _

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    change_form_template = "admin/accounts/user/change_form.html"
    ordering = ("-date_joined",)
    list_display = ("email", "username", "full_name", "role", "seller_account_status", "is_active", "is_blocked", "is_staff")
    list_filter = ("role", "seller_account_status", "is_active", "is_blocked", "is_staff", "is_superuser")
    actions = ("approve_seller_accounts", "reject_seller_accounts", "mark_seller_pending")

    @admin.action(description="Approve seller account (selected rows)")
    def approve_seller_accounts(self, request, queryset):
        n = queryset.filter(role=User.Role.SELLER).update(seller_account_status=User.SellerAccountStatus.APPROVED)
        self.message_user(request, f"Approved {n} seller account(s).")

    @admin.action(description="Reject seller account (selected rows)")
    def reject_seller_accounts(self, request, queryset):
        n = queryset.filter(role=User.Role.SELLER).update(seller_account_status=User.SellerAccountStatus.REJECTED)
        self.message_user(request, f"Rejected {n} seller account(s).")

    @admin.action(description="Set seller account back to pending (selected rows)")
    def mark_seller_pending(self, request, queryset):
        n = queryset.filter(role=User.Role.SELLER).update(seller_account_status=User.SellerAccountStatus.PENDING)
        self.message_user(request, f"Set {n} seller account(s) to pending.")

    def get_urls(self):
        info = self.model._meta.app_label, self.model._meta.model_name
        return [
            path(
                "<path:object_id>/set-seller-status/",
                self.admin_site.admin_view(self.set_seller_status_view),
                name="%s_%s_set_seller_status" % info,
            ),
        ] + super().get_urls()

    def set_seller_status_view(self, request, object_id):
        if request.method != "POST":
            return HttpResponseNotAllowed(["POST"])
        if not self.has_change_permission(request):
            raise PermissionDenied
        obj = self.get_object(request, object_id)
        if obj is None:
            raise Http404
        if obj.role != User.Role.SELLER:
            messages.error(request, _("Only seller accounts have an approval status."))
            return HttpResponseRedirect(self._seller_tools_redirect(obj))
        raw = (request.POST.get("seller_account_status") or "").strip()
        allowed = {
            User.SellerAccountStatus.PENDING,
            User.SellerAccountStatus.APPROVED,
            User.SellerAccountStatus.REJECTED,
        }
        if raw not in allowed:
            messages.error(request, _("Invalid seller account status."))
            return HttpResponseRedirect(self._seller_tools_redirect(obj))
        if obj.seller_account_status == raw:
            messages.info(request, _("Seller account status is already %(label)s.") % {"label": obj.get_seller_account_status_display()})
        else:
            old = obj.get_seller_account_status_display()
            obj.seller_account_status = raw
            obj.save(update_fields=["seller_account_status"])
            self.log_change(
                request,
                obj,
                [{"changed": {"fields": ["seller_account_status"]}}],
            )
            messages.success(
                request,
                _("Seller account status changed from %(old)s to %(new)s.")
                % {"old": old, "new": obj.get_seller_account_status_display()},
            )
        return HttpResponseRedirect(self._seller_tools_redirect(obj))

    def _seller_tools_redirect(self, obj):
        return reverse("admin:%s_%s_change" % (self.model._meta.app_label, self.model._meta.model_name), args=[obj.pk])

    def change_view(self, request, object_id, form_url="", extra_context=None):
        extra_context = extra_context or {}
        obj = self.get_object(request, object_id)
        if (
            obj
            and obj.role == User.Role.SELLER
            and self.has_change_permission(request, obj)
        ):
            extra_context["show_seller_status_tools"] = True
            extra_context["seller_status_action_url"] = reverse(
                "admin:%s_%s_set_seller_status"
                % (self.model._meta.app_label, self.model._meta.model_name),
                args=[object_id],
                current_app=self.admin_site.name,
            )
        return super().change_view(request, object_id, form_url, extra_context=extra_context)

    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        (
            "Profile",
            {
                "fields": (
                    "full_name",
                    "phone_number",
                    "avatar",
                    "role",
                    "seller_account_status",
                    "is_email_verified",
                    "is_blocked",
                )
            },
        ),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "username", "password1", "password2", "role", "full_name"),
            },
        ),
    )
    search_fields = ("email", "username", "full_name")
