from django.contrib.auth import get_user_model
from django.urls import path
from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.common.permissions import IsNotBlocked

from .serializers import EmailTokenObtainPairSerializer, UserRegisterSerializer, UserSerializer

User = get_user_model()


class StaffSupportContactView(APIView):
    """Returns a superadmin id so buyers/sellers can open a support chat (no product thread)."""

    permission_classes = [IsAuthenticated, IsNotBlocked]

    def get(self, request):
        if getattr(request.user, "role", None) == User.Role.SUPERADMIN:
            return Response({"detail": "Not applicable."}, status=status.HTTP_400_BAD_REQUEST)
        admin_user = (
            User.objects.filter(role=User.Role.SUPERADMIN, is_active=True).order_by("pk").first()
        )
        if not admin_user:
            return Response(
                {"detail": "No platform administrator is configured. Run seed_initial_data.py."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(
            {
                "id": admin_user.id,
                "email": admin_user.email,
                "full_name": admin_user.full_name or "",
            }
        )


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegisterSerializer


class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class LogoutView(APIView):
    permission_classes = [IsAuthenticated, IsNotBlocked]

    def post(self, request):
        return Response({"detail": "Logged out. Discard tokens on the client."}, status=status.HTTP_200_OK)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsNotBlocked]

    def get_object(self):
        return self.request.user


urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("support-contact/", StaffSupportContactView.as_view(), name="auth-support-contact"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("me/", MeView.as_view(), name="auth-me"),
]
