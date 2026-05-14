from rest_framework import permissions


class IsNotBlocked(permissions.BasePermission):
    def has_permission(self, request, view):
        u = request.user
        if not u or not u.is_authenticated:
            return True
        return not getattr(u, "is_blocked", False)


class IsBuyer(permissions.BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and getattr(u, "role", None) == "buyer")


class IsSeller(permissions.BasePermission):
    def has_permission(self, request, view):
        u = request.user
        if not u or not u.is_authenticated:
            return False
        if getattr(u, "role", None) == "superadmin":
            return True
        if getattr(u, "role", None) != "seller":
            return False
        return getattr(u, "seller_account_status", None) == "approved"


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and getattr(u, "role", None) == "superadmin")


class IsSellerOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        return obj.seller_id == request.user.id


class IsOwnerOrSuperAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if getattr(request.user, "role", None) == "superadmin":
            return True
        owner = getattr(obj, "seller", None) or getattr(obj, "buyer", None) or getattr(obj, "user", None)
        return owner == request.user


class IsBuyerOrSellerAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and getattr(u, "role", None) in ("buyer", "seller", "superadmin"))
