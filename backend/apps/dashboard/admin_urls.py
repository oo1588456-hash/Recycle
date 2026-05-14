from django.urls import path

from apps.dashboard.admin_views import (
    AdminAIAnalysesView,
    AdminDashboardStatsView,
    AdminDatasetReportView,
    AdminProductDeleteView,
    AdminProductStatusView,
    AdminProductsView,
    AdminSeedDefaultCategoriesView,
    AdminSellerStatusView,
    AdminSupportInboxView,
    AdminUserBlockView,
    AdminUserDeleteView,
    AdminUsersView,
    AdminUserUnblockView,
)
from apps.orders.views import AdminOrderStatusView, AdminOrdersView

urlpatterns = [
    path("categories/seed-defaults/", AdminSeedDefaultCategoriesView.as_view()),
    path("dashboard/stats/", AdminDashboardStatsView.as_view()),
    path("users/", AdminUsersView.as_view()),
    path("users/<int:pk>/block/", AdminUserBlockView.as_view()),
    path("users/<int:pk>/unblock/", AdminUserUnblockView.as_view()),
    path("users/<int:pk>/seller-status/", AdminSellerStatusView.as_view()),
    path("users/<int:pk>/", AdminUserDeleteView.as_view()),
    path("support/inbox/", AdminSupportInboxView.as_view()),
    path("products/", AdminProductsView.as_view()),
    path("products/<int:pk>/status/", AdminProductStatusView.as_view()),
    path("products/<int:pk>/", AdminProductDeleteView.as_view()),
    path("orders/", AdminOrdersView.as_view()),
    path("orders/<int:pk>/status/", AdminOrderStatusView.as_view()),
    path("ai-analyses/", AdminAIAnalysesView.as_view()),
    path("dataset-report/", AdminDatasetReportView.as_view()),
]
