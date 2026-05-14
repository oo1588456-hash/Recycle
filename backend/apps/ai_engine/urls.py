from django.urls import path

from apps.ai_engine.views import AIHistoryView, DatasetReportView

urlpatterns = [
    path("history/", AIHistoryView.as_view(), name="ai-history"),
    path("dataset-report/", DatasetReportView.as_view(), name="ai-dataset-report"),
]
