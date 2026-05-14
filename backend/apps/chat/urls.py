from django.urls import path

from .views import ConversationListView, MessageListCreateView

urlpatterns = [
    path("messages/", MessageListCreateView.as_view(), name="chat-messages"),
    path("conversations/", ConversationListView.as_view(), name="chat-conversations"),
]
