import json
from pathlib import Path

from django.conf import settings
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ai_engine.models import AIAnalysisResult
from apps.ai_engine.serializers import AIAnalysisResultSerializer
from apps.common.permissions import IsNotBlocked, IsSeller


class AIHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked, IsSeller]

    def get(self, request):
        qs = AIAnalysisResult.objects.filter(seller=request.user).order_by("-created_at")[:100]
        return Response(AIAnalysisResultSerializer(qs, many=True).data)


class DatasetReportView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        backend = Path(settings.BASE_DIR)
        summary = backend / "data" / "dataset_summary.json"
        if summary.exists():
            return Response(json.loads(summary.read_text(encoding="utf-8")))
        report = backend / "docs" / "DATASETS_REPORT.md"
        if report.exists():
            return Response({"markdown": report.read_text(encoding="utf-8")})
        return Response({"detail": "Run scan_datasets first."}, status=404)
