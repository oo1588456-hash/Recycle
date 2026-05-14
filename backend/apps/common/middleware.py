"""Block blocked users from API access after authentication."""
from django.http import JsonResponse


class BlockedUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        u = getattr(request, "user", None)
        if u is not None and u.is_authenticated and getattr(u, "is_blocked", False):
            if request.path.startswith("/api/"):
                return JsonResponse({"detail": "Your account has been blocked."}, status=403)
        return self.get_response(request)
