from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "full_name",
            "phone_number",
            "avatar",
            "role",
            "seller_account_status",
            "is_blocked",
            "is_email_verified",
            "created_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "is_email_verified",
            "role",
            "is_blocked",
            "seller_account_status",
        )


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(required=False, allow_blank=True, max_length=255)

    class Meta:
        model = User
        fields = ("email", "username", "full_name", "password", "role", "phone_number")

    def validate_role(self, value: str) -> str:
        if value == User.Role.SUPERADMIN:
            raise ValidationError("Public registration cannot create superadmin accounts.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        role = validated_data.get("role", User.Role.BUYER)
        user = User(**validated_data)
        if role == User.Role.SELLER:
            user.seller_account_status = User.SellerAccountStatus.PENDING
        else:
            user.seller_account_status = User.SellerAccountStatus.NA
        user.set_password(password)
        user.save()
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

    def validate(self, attrs):
        data = super().validate(attrs)
        if self.user.is_blocked:
            raise ValidationError("This account has been blocked.")
        data["user"] = UserSerializer(self.user).data
        return data
