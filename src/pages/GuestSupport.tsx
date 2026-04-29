import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, Loader2, Send, XCircle, Paperclip, Mic, Square } from "lucide-react";
import Footer from "@/components/Footer";
import { supportApi, type SupportTicket } from "@/services/supportApi";
import { subscribeToGuestSupportTicket } from "@/lib/reverb";
import { MessageAttachments, SelectedAttachments } from "@/components/SupportAttachments";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

const STATUS_CONFIG = {
  open:        { label: "Open",        icon: AlertCircle,  color: "text-blue-600 bg-blue-50" },
  in_progress: { label: "In Progress", icon: Clock,        color: "text-yellow-600 bg-yellow-50" },
  resolved:    { label: "Resolved",    icon: CheckCircle2, color: "text-green-600 bg-green-50" },
  closed:      { label: "Closed",      icon: XCircle,      color: "text-gray-500 bg-gray-100" },
} as const;

function StatusBadge({ status }: { status: SupportTicket["status"] }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "Yesterday";
  return new Date(dateStr).toLocaleString();
}

function hasNewStaffMessage(previous: SupportTicket | null, next: SupportTicket): boolean {
  if (!previous) return false;

  return next.messages.some((message) => {
    if (message.senderType !== "staff") return false;
    return !previous.messages.some((existing) => existing.id === message.id);
  });
}

export default function GuestSupport() {
  const { ticketNumber = "" } = useParams<{ ticketNumber: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ticketRef = useRef<SupportTicket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isRecording, start: startRecording, stop: stopRecording } = useVoiceRecorder();

  const canReply = useMemo(() => ticket && ticket.status !== "closed", [ticket]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const loadTicket = useCallback(async (silent = false) => {
    if (!ticketNumber || !token) {
      setError("This support link is incomplete or invalid.");
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);
    try {
      const next = await supportApi.getGuest(ticketNumber, token);
      if (hasNewStaffMessage(ticketRef.current, next)) {
        playNotificationSound();
        toast.success("Support replied to your message.");
      }
      ticketRef.current = next;
      setTicket(next);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to load this conversation.");
    } finally {
      setLoading(false);
    }
  }, [ticketNumber, token]);

  useEffect(() => {
    void loadTicket();
  }, [loadTicket]);

  useEffect(() => {
    if (!ticketNumber || !token) return;
    const interval = setInterval(() => { void loadTicket(true); }, 30000);
    return () => clearInterval(interval);
  }, [loadTicket, ticketNumber, token]);

  useEffect(() => {
    if (!ticket?.id || !token) return;

    return subscribeToGuestSupportTicket(ticket.id, token, {
      onMessageSent: (id, message) => {
        if (id !== ticket.id) return;

        setTicket((prev) => {
          if (!prev || prev.messages.some((existing) => existing.id === message.id)) return prev;
          const next = { ...prev, messages: [...prev.messages, message] };
          ticketRef.current = next;
          return next;
        });

        if (message.senderType === "staff") {
          playNotificationSound();
          toast.success("Support replied to your message.");
        }
      },
      onStatusUpdated: (id, status) => {
        if (id !== ticket.id) return;
        setTicket((prev) => {
          if (!prev) return prev;
          const next = { ...prev, status };
          ticketRef.current = next;
          return next;
        });
      },
      onPriorityUpdated: () => {},
    });
  }, [ticket?.id, token]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages.length, scrollToBottom]);

  const sendReply = async () => {
    const body = reply.trim();
    if ((!body && attachments.length === 0) || !ticketNumber || !token) return;
    setSending(true);
    try {
      const updated = await supportApi.replyGuest(ticketNumber, token, { body, attachments });
      ticketRef.current = updated;
      setTicket(updated);
      setReply("");
      setAttachments([]);
      toast.success("Your reply has been sent.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send your reply.");
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length === 0) return;
    setAttachments((prev) => [...prev, ...selected].slice(0, 5));
    event.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    try {
      await startRecording((file) => setAttachments((prev) => [...prev, file].slice(0, 5)));
    } catch {
      toast.error("Microphone access failed.");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28">
      <div className="container pb-16">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Guest Support</p>
            <h1 className="font-display text-3xl font-bold text-foreground">Support Conversation</h1>
          </div>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Contact
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
            <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
            Loading support conversation...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
            <h2 className="font-semibold text-foreground">Unable to open this conversation</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        ) : ticket ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-6 py-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{ticket.ticketNumber}</p>
                  <h2 className="mt-1 text-xl font-semibold text-foreground">{ticket.subject}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {ticket.customerName || "Guest"} · {ticket.customerEmail || "No email"} · Created {relativeTime(ticket.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={ticket.status} />
                  <button
                    onClick={() => void loadTicket(true)}
                    className="rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-[480px] overflow-y-auto px-6 py-5 space-y-4">
              {ticket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.senderType === "staff"
                      ? "bg-primary/10 text-foreground"
                      : "ml-auto bg-muted text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {message.senderType === "staff" ? (message.senderName || "Support Team") : "You"}
                    </p>
                    <span className="text-[11px] text-muted-foreground">{relativeTime(message.createdAt)}</span>
                  </div>
                  {message.body ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.body}</p> : null}
                  <MessageAttachments attachments={message.attachments} />
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border px-6 py-5">
              {canReply ? (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.txt,.csv,.xls,.xlsx,.doc,.docx,audio/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <label className="block text-sm font-medium text-foreground">Reply to support</label>
                  <SelectedAttachments attachments={attachments} onRemove={removeAttachment} />
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                    placeholder="Write your follow-up message here..."
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-muted transition-colors">
                        <Paperclip className="w-4 h-4" />
                        Attach
                      </button>
                      <button type="button" onClick={handleVoiceToggle} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-muted transition-colors">
                        {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        {isRecording ? "Stop" : "Voice"}
                      </button>
                    </div>
                    <button
                      onClick={sendReply}
                      disabled={sending || (!reply.trim() && attachments.length === 0)}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send Reply
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">This ticket is closed and can no longer receive replies.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
      <Footer />
    </div>
  );
}
