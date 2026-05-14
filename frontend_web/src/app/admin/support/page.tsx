"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Headphones, RefreshCw, Send } from "lucide-react";
import { api } from "@/lib/api/client";
import { chatMessageListParams, messageSenderId } from "@/lib/chat/threadParams";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { useAuthStore } from "@/lib/auth/auth-store";

type Peer = { id: number; full_name?: string | null; username?: string; email?: string; role?: string };

type Conv = {
  peer: Peer;
  product: number | null;
  last_message: string;
  unread_count: number;
};

type ChatMessage = {
  id: number;
  message: string;
  sender: Peer | number;
};

export default function AdminSupportPage() {
  const uid = useAuthStore((s) => s.user?.id);
  const [convs, setConvs] = useState<Conv[]>([]);
  const [selected, setSelected] = useState<Conv | null>(null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loadingInbox, setLoadingInbox] = useState(false);

  const loadConvs = useCallback(async () => {
    const r = await api.get("/admin/support/inbox/");
    const list = r.data as Conv[];
    setConvs(list);
    return list;
  }, []);

  const loadMsgs = useCallback(async (peerId: number) => {
    const r = await api.get("/chat/messages/", { params: chatMessageListParams(peerId, null) });
    setMsgs(Array.isArray(r.data) ? r.data : []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingInbox(true);
      try {
        const list = await loadConvs();
        if (cancelled) return;
        const p = new URLSearchParams(window.location.search).get("peer");
        if (p) {
          const pi = Number(p);
          const hit = list.find((x) => x.peer.id === pi);
          setSelected(
            hit ?? {
              peer: { id: pi, username: `user-${pi}` },
              product: null,
              last_message: "",
              unread_count: 0,
            },
          );
          await loadMsgs(pi);
        }
      } finally {
        if (!cancelled) setLoadingInbox(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadConvs, loadMsgs]);

  const poll = useRef<number | null>(null);
  useEffect(() => {
    if (!selected?.peer.id) return;
    const peerId = selected.peer.id;
    poll.current = window.setInterval(() => {
      void loadMsgs(peerId);
      void loadConvs();
    }, 8000);
    return () => {
      if (poll.current) window.clearInterval(poll.current);
    };
  }, [selected?.peer.id, loadMsgs, loadConvs]);

  async function send() {
    if (!selected?.peer.id || !text.trim()) return;
    await api.post("/chat/messages/", { receiver: selected.peer.id, message: text.trim() });
    setText("");
    await loadMsgs(selected.peer.id);
    await loadConvs();
  }

  const peer = selected?.peer;

  return (
    <>
      <AdminPageHeader
        title="Messages"
        description="Platform inbox: chat with buyers and sellers who message ReCycle staff (no product thread)."
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <AppButton
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => {
            setLoadingInbox(true);
            void loadConvs().finally(() => setLoadingInbox(false));
          }}
          disabled={loadingInbox}
        >
          <RefreshCw className={`h-4 w-4 ${loadingInbox ? "animate-spin" : ""}`} />
          Refresh inbox
        </AppButton>
      </div>
      <div className="flex min-h-[min(32rem,calc(100vh-12rem))] flex-col gap-4 lg:flex-row">
        <AdminPanel className="flex w-full flex-col overflow-hidden lg:max-w-sm">
          <div className="border-b border-slate-100 bg-slate-50/90 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Headphones className="h-4 w-4 text-emerald-600" />
              Platform threads
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{convs.length} conversation{convs.length === 1 ? "" : "s"}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {convs.map((c) => (
              <button
                key={c.peer.id}
                type="button"
                onClick={() => {
                  setSelected(c);
                  void loadMsgs(c.peer.id);
                }}
                className={`mb-1 w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                  selected?.peer.id === c.peer.id
                    ? "bg-emerald-50 ring-1 ring-emerald-200/80"
                    : "hover:bg-slate-50"
                }`}
              >
                <p className="font-semibold text-slate-900">{c.peer.full_name || c.peer.username}</p>
                <p className="truncate text-xs text-slate-500">{c.peer.email}</p>
                {c.peer.role && (
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {c.peer.role}
                  </p>
                )}
                <p className="mt-1 truncate text-xs text-slate-400">{c.last_message}</p>
                {c.unread_count > 0 && (
                  <span className="mt-2 inline-flex rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    {c.unread_count} new
                  </span>
                )}
              </button>
            ))}
            {convs.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-slate-500">
                No messages yet. Buyers and sellers can reach you from <strong>Messages → Platform</strong> on the
                storefront, or from the pending-approval screen.
              </p>
            )}
          </div>
        </AdminPanel>

        <AdminPanel className="flex flex-1 flex-col overflow-hidden">
          {!peer ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
              <Headphones className="h-10 w-10 text-slate-300" />
              <p className="max-w-md text-sm text-slate-500">
                Select a conversation. You can also open{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">
                  /admin/support?peer=USER_ID
                </code>{" "}
                from the Users table.
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Thread</p>
                <p className="text-sm font-semibold text-slate-900">{peer.full_name || peer.username}</p>
                <p className="text-xs text-slate-500">{peer.email}</p>
              </div>
              <div className="flex max-h-[min(24rem,50vh)] flex-1 flex-col gap-2 overflow-y-auto bg-gradient-to-b from-slate-50/50 to-white p-4">
                {msgs.map((m) => {
                  const sid = messageSenderId(m.sender);
                  const mine = sid != null && sid === uid;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          mine
                            ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white"
                            : "border border-slate-200/80 bg-white text-slate-800"
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>
              <form
                className="flex min-w-0 flex-1 gap-2 border-t border-slate-100 bg-white p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
              >
                <div className="min-w-0 flex-1">
                  <AppInput value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a reply…" />
                </div>
                <AppButton type="submit" className="shrink-0 gap-2">
                  <Send className="h-4 w-4" />
                  Send
                </AppButton>
              </form>
            </>
          )}
        </AdminPanel>
      </div>
    </>
  );
}
