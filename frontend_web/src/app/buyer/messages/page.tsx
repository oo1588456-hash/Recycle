"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import { chatMessageListParams, messageSenderId } from "@/lib/chat/threadParams";
import { Card } from "@/components/ui/Card";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { useAuthStore } from "@/lib/auth/auth-store";

type Peer = { id: number; full_name?: string | null; username?: string; email?: string };

type Conv = {
  peer: Peer;
  product: number | null;
  last_message: string;
  unread_count?: number;
};

type ChatMessage = {
  id: number;
  message: string;
  sender: Peer | number;
};

export default function BuyerMessagesPage() {
  const uid = useAuthStore((s) => s.user?.id);
  const user = useAuthStore((s) => s.user);
  const [convs, setConvs] = useState<Conv[]>([]);
  const [peer, setPeer] = useState<number | null>(null);
  const [product, setProduct] = useState<number | null>(null);
  const [activeLabel, setActiveLabel] = useState<string>("");
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");

  const loadMsgs = useCallback(async (p: number, prod: number | null) => {
    const r = await api.get("/chat/messages/", { params: chatMessageListParams(p, prod) });
    setMsgs(Array.isArray(r.data) ? r.data : []);
  }, []);

  const loadConvs = useCallback(async () => {
    const r = await api.get("/chat/conversations/");
    let list = (r.data as Conv[]) ?? [];
    if (user?.role === "buyer") {
      try {
        const sc = await api.get("/auth/support-contact/");
        const adminId = (sc.data as { id: number }).id;
        const hasPlatform = list.some((c) => c.peer.id === adminId && (c.product == null || c.product === 0));
        if (!hasPlatform) {
          const email = (sc.data as { email?: string }).email;
          const fullName = (sc.data as { full_name?: string }).full_name;
          list = [
            {
              peer: {
                id: adminId,
                full_name: fullName || "ReCycle admin",
                username: "platform",
                email,
              },
              product: null,
              last_message: "Message the marketplace team",
              unread_count: 0,
            },
            ...list,
          ];
        }
      } catch {
        /* ignore */
      }
    }
    setConvs(list);
    return list;
  }, [user?.role]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const list = await loadConvs();
      if (cancelled) return;

      const s = new URLSearchParams(window.location.search);
      const p = s.get("peer");
      const pr = s.get("product");
      if (p) {
        const pi = Number(p);
        const prod = pr ? Number(pr) : null;
        const hit = list.find((c) => c.peer.id === pi && (c.product ?? null) === (prod ?? null));
        setPeer(pi);
        setProduct(prod);
        setActiveLabel(hit?.peer.full_name || hit?.peer.username || `User #${pi}`);
        await loadMsgs(pi, prod);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [loadConvs, loadMsgs]);

  const poll = useRef<number | null>(null);
  useEffect(() => {
    if (!peer) return;
    poll.current = window.setInterval(() => void loadMsgs(peer, product), 8000);
    return () => {
      if (poll.current) window.clearInterval(poll.current);
    };
  }, [peer, product, loadMsgs]);

  async function send() {
    if (!peer || !text.trim()) return;
    const body: { receiver: number; message: string; product?: number } = {
      receiver: peer,
      message: text.trim(),
    };
    if (product != null) body.product = product;
    await api.post("/chat/messages/", body);
    setText("");
    await loadMsgs(peer, product);
    void loadConvs();
  }

  const mobileValue = peer ? `${peer}-${product ?? "p"}` : "";

  return (
    <div className="mx-auto flex max-w-6xl min-h-[70vh] flex-col gap-4 px-4 py-8 md:flex-row">
      <div className="md:hidden">
        <label className="mb-1 block text-xs font-semibold text-recycle-muted">Conversation</label>
        <select
          className="w-full rounded-xl border-2 border-recycle-border bg-white px-3 py-2 text-sm"
          value={mobileValue}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) {
              setPeer(null);
              setProduct(null);
              setActiveLabel("");
              setMsgs([]);
              return;
            }
            const [pid, prodPart] = v.split("-");
            const pi = Number(pid);
            const prod = prodPart === "p" ? null : Number(prodPart);
            const hit = convs.find((c) => c.peer.id === pi && (c.product ?? null) === (prod ?? null));
            setPeer(pi);
            setProduct(prod);
            setActiveLabel(hit?.peer.full_name || hit?.peer.username || `User #${pi}`);
            void loadMsgs(pi, prod);
          }}
        >
          <option value="">Select…</option>
          {convs.map((c) => (
            <option key={`${c.peer.id}-${c.product ?? "p"}`} value={`${c.peer.id}-${c.product ?? "p"}`}>
              {(c.peer.full_name || c.peer.username || `#${c.peer.id}`) +
                (c.product ? ` · product #${c.product}` : " · platform")}
            </option>
          ))}
        </select>
      </div>

      <Card className="hidden w-80 shrink-0 flex-col p-3 md:flex">
        <h2 className="px-2 py-2 text-sm font-bold">Conversations</h2>
        <div className="max-h-[60vh] flex-1 space-y-1 overflow-y-auto">
          {convs.map((c) => {
            const active = peer === c.peer.id && (product ?? null) === (c.product ?? null);
            return (
              <button
                key={`${c.peer.id}-${c.product ?? 0}`}
                type="button"
                className={`w-full rounded-lg px-2 py-2 text-left text-sm ${
                  active ? "bg-recycle-mint/80 ring-1 ring-recycle-primary/30" : "hover:bg-recycle-surface"
                }`}
                onClick={() => {
                  setPeer(c.peer.id);
                  setProduct(c.product);
                  setActiveLabel(c.peer.full_name || c.peer.username || `User #${c.peer.id}`);
                  void loadMsgs(c.peer.id, c.product);
                }}
              >
                <p className="font-semibold">{c.peer.full_name || c.peer.username}</p>
                {c.product ? (
                  <p className="text-[10px] font-medium uppercase tracking-wide text-recycle-muted">Product listing</p>
                ) : (
                  <p className="text-[10px] font-medium uppercase tracking-wide text-recycle-primary">Platform</p>
                )}
                <p className="truncate text-xs text-recycle-muted">{c.last_message}</p>
                {!!c.unread_count && c.unread_count > 0 && (
                  <span className="mt-1 inline-block rounded-full bg-recycle-primary px-2 py-0.5 text-[10px] font-bold text-white">
                    {c.unread_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="flex min-h-[22rem] flex-1 flex-col">
        {!peer ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-recycle-muted">
            <p>Select a conversation or open from a product page.</p>
            <p className="max-w-sm text-xs">
              Choose <strong>Platform</strong> to reach marketplace staff. Listing chats stay tied to each product.
            </p>
          </div>
        ) : (
          <>
            <div className="border-b border-recycle-border px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-recycle-muted">Active thread</p>
              <p className="text-sm font-semibold text-recycle-charcoal">{activeLabel}</p>
              {product != null && <p className="text-xs text-recycle-muted">Product #{product}</p>}
            </div>
            <div className="max-h-[55vh] flex-1 space-y-2 overflow-y-auto p-4">
              {msgs.map((m) => {
                const sid = messageSenderId(m.sender);
                const mine = sid != null && sid === uid;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        mine ? "bg-recycle-primary text-white" : "bg-recycle-surface text-recycle-charcoal"
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                );
              })}
            </div>
            <form
              className="flex gap-2 border-t border-recycle-border p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <AppInput
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
                className="flex-1"
              />
              <AppButton type="submit">Send</AppButton>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
