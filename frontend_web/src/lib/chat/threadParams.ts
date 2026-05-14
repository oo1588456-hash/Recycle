/** Query params for `GET /chat/messages/` — platform DMs must set `support_only` so product threads are not mixed in. */
export function chatMessageListParams(peerId: number, productId: number | null) {
  const params: Record<string, string | number> = { receiver: peerId };
  if (productId != null) {
    params.product = productId;
  } else {
    params.support_only = 1;
  }
  return params;
}

export function messageSenderId(sender: { id?: number } | number | undefined): number | null {
  if (sender == null) return null;
  if (typeof sender === "object" && "id" in sender && sender.id != null) return sender.id;
  if (typeof sender === "number") return sender;
  return null;
}
