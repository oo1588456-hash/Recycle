"""
Django settings for ReCycle backend (development).
"""
import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("SECRET_KEY", "django-insecure-dev-only-change-me")

DEBUG = os.environ.get("DEBUG", "True").lower() in ("1", "true", "yes")

ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1,10.0.2.2").split(",")
    if h.strip()
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "drf_spectacular",
    "apps.accounts",
    "apps.categories",
    "apps.products",
    "apps.ai_engine",
    "apps.cart",
    "apps.orders",
    "apps.chat",
    "apps.dashboard",
    "apps.common",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "apps.common.middleware.BlockedUserMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "recycle_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "recycle_backend.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "accounts.User"

# Datasets: repo root /datasets unless DATASETS_DIR is set
DATASETS_DIR = Path(os.environ.get("DATASETS_DIR", "") or (BASE_DIR.parent / "datasets")).resolve()
DEFAULT_CURRENCY = os.environ.get("DEFAULT_CURRENCY", "GBP")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
USE_GEMINI_AI = os.environ.get("USE_GEMINI_AI", "True").lower() in ("1", "true", "yes")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
FILE_UPLOAD_MAX_MEMORY_SIZE = 6 * 1024 * 1024
DATA_UPLOAD_MAX_MEMORY_SIZE = 6 * 1024 * 1024

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.AllowAny",),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=12),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": False,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

SPECTACULAR_SETTINGS = {
    "TITLE": "ReCycle API",
    "DESCRIPTION": "AI-powered used product marketplace",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

CORS_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8080,http://127.0.0.1:8080",
    ).split(",")
    if o.strip()
]
# Browser dev + some Flutter web builds
for _origin in (
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
):
    if _origin not in CORS_ALLOWED_ORIGINS:
        CORS_ALLOWED_ORIGINS.append(_origin)

if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8005",
    "http://127.0.0.1:8005",
    "http://10.0.2.2:8005",
]
