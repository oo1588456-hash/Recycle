from django.db.models import Q, Subquery
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.chat.models import Message
from apps.chat.serializers import MessageCreateSerializer, MessageSerializer
from apps.common.permissions import IsNotBlocked
from apps.products.serializers import SellerMiniSerializer


def _truthy_support_only(request) -> bool:
    v = str(request.query_params.get("support_only", "")).lower()
    return v in ("1", "true", "yes", "on")


class MessageListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked]
    serializer_class = MessageSerializer
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == "POST":
            return MessageCreateSerializer
        return MessageSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Message.objects.select_related("sender", "receiver", "product").filter(
            Q(sender=user) | Q(receiver=user)
        )
        receiver = self.request.query_params.get("receiver") or self.request.query_params.get("receiver_id")
        product = self.request.query_params.get("product")
        support_only = _truthy_support_only(self.request)

        if receiver:
            qs = qs.filter(
                Q(receiver_id=receiver, sender=user) | Q(sender_id=receiver, receiver=user)
            )
        if support_only:
            qs = qs.filter(product__isnull=True, order__isnull=True)
        elif product is not None and str(product) != "":
            qs = qs.filter(product_id=product)

        return qs.order_by("created_at")

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        Message.objects.filter(
            pk__in=Subquery(qs.filter(receiver=request.user, is_read=False).values("pk"))
        ).update(is_read=True)
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


class ConversationListView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsNotBlocked]

    def get(self, request):
        user = request.user
        msgs = (
            Message.objects.select_related("sender", "receiver", "product")
            .filter(Q(sender=user) | Q(receiver=user))
            .order_by("-created_at")
        )
        seen: set[tuple[int, int]] = set()
        out = []
        for m in msgs:
            other = m.receiver if m.sender_id == user.id else m.sender
            pid = m.product_id or 0
            key = (other.id, pid)
            if key in seen:
                continue
            seen.add(key)
            unread = Message.objects.filter(receiver=user, sender=other, is_read=False)
            if pid:
                unread = unread.filter(product_id=m.product_id)
            else:
                unread = unread.filter(product__isnull=True)
            out.append(
                {
                    "peer": SellerMiniSerializer(other).data,
                    "product": m.product_id,
                    "last_message": m.message[:280],
                    "last_at": m.created_at,
                    "unread_count": unread.count(),
                }
            )
        return Response(out, status=status.HTTP_200_OK)
