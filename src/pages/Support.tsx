import { cn } from "@/lib/utils"
import { useState, useEffect, useRef, useCallback, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import {
  Headphones, ChevronRight, Plus, Send, ArrowLeft,
  CheckCircle2, Clock, AlertCircle, XCircle, MessageSquare, X, Paperclip, Mic, Square,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { FormField } from "@/components/common/FormField";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToSupportTicket } from "@/lib/reverb";
import { supportApi, type SupportTicket, type TicketCategory, type SupportMessage } from "@/services/supportApi";
import { MessageAttachments, SelectedAttachments } from "@/components/SupportAttachments";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

// ── Sound ─────────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────
const newTicketSchema = z.object({
  subject:  z.string().trim().min(3, "Subject is required").max(255),
  message:  z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
  category: z.enum(["order", "product", "payment", "shipping", "general"]),
});
type NewTicketData = z.infer<typeof newTicketSchema>;

const STATUS_CONFIG = {
  open:        { label: "Open",        icon: AlertCircle },
  in_progress: { label: "In Progress", icon: Clock },
  resolved:    { label: "Resolved",    icon: CheckCircle2 },
  closed:      { label: "Closed",      icon: XCircle },
};

const CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: "order",    label: "Order Support" },
  { value: "product",  label: "Product Inquiry" },
  { value: "payment",  label: "Payment Issue" },
  { value: "shipping", label: "Shipping Problem" },
  { value: "general",  label: "General Question" },
];

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "Yesterday";
  return new Date(dateStr).toLocaleDateString();
}

function hasNewIncomingMessage(previous: SupportTicket | null, next: SupportTicket): boolean {
  if (!previous) return false;

  return next.messages.some((message) => {
    if (message.senderType !== "staff") return false;
    return !previous.messages.some((existing) => existing.id === message.id);
  });
}

function TicketStatusBadge({ status }: { status: SupportTicket["status"] }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <StatusBadge status={status} className="gap-1" label={<><Icon className="w-3 h-3" /> {cfg.label}</>} />
  );
}

// ── New Ticket Form ───────────────────────────────────────────────
function NewTicketForm({ onCreated, onCancel }: { onCreated: (t: SupportTicket) => void; onCancel: () => void }) {
  const [form, setForm] = useState<NewTicketData>({ subject: "", message: "", category: "general" });
  const [errors, setErrors] = useState<Partial<Record<keyof NewTicketData, string>>>({});
  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isRecording, start: startRecording, stop: stopRecording } = useVoiceRecorder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = newTicketSchema.safeParse(form);
    if (!result.success) {
      const errs: typeof errors = {};
      result.error.errors.forEach((err) => { errs[err.path[0] as keyof NewTicketData] = err.message; });
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const ticket = await supportApi.create({ ...form, attachments });
      toast.success("Ticket submitted! We'll get back to you soon.");
      onCreated(ticket);
    } catch {
      toast.error("Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
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
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4">
        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Back">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Button>
        <h2 className="font-semibold">New Support Ticket</h2>
      </div>
      <Separator />

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.csv,.xls,.xlsx,.doc,.docx,audio/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <FormField label="Category" htmlFor="new-ticket-category">
          <Select
            value={form.category}
            onValueChange={(v) => setForm((f) => ({ ...f, category: v as TicketCategory }))}
          >
            <SelectTrigger id="new-ticket-category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Subject" htmlFor="new-ticket-subject" error={errors.subject}>
          <Input
            id="new-ticket-subject"
            value={form.subject}
            onChange={(e) => { setForm((f) => ({ ...f, subject: e.target.value })); setErrors((p) => ({ ...p, subject: "" })); }}
            placeholder="Briefly describe your issue"
          />
        </FormField>
        <FormField label="Message" htmlFor="new-ticket-message" error={errors.message}>
          <Textarea
            id="new-ticket-message"
            value={form.message}
            onChange={(e) => { setForm((f) => ({ ...f, message: e.target.value })); setErrors((p) => ({ ...p, message: "" })); }}
            rows={5}
            placeholder="Describe your issue in detail…"
            className="resize-none"
          />
        </FormField>
        <SelectedAttachments attachments={attachments} onRemove={removeAttachment} />
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="w-4 h-4" />
            Attach
          </Button>
          <Button type="button" variant="outline" onClick={handleVoiceToggle}>
            {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording ? "Stop" : "Voice"}
          </Button>
        </div>
        <div className="flex gap-3">
          <Button
            type="button" variant="outline" onClick={onCancel}
            className="flex-1"
          >Cancel</Button>
          <Button
            type="submit" disabled={submitting}
            className="flex-1"
          >
            {submitting ? <Spinner /> : <Send className="w-4 h-4" />}
            Submit Ticket
          </Button>
        </div>
      </form>
    </div>
  );
}

// ── Chat Panel ────────────────────────────────────────────────────
function ChatPanel({ ticketId, onBack, onTicketUpdate }: {
  ticketId: number
  onBack: () => void
  onTicketUpdate: (t: SupportTicket) => void
}) {
  const { user } = useAuth();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const optimisticIds = useRef<Set<number>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ticketRef = useRef<SupportTicket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isRecording, start: startRecording, stop: stopRecording } = useVoiceRecorder();

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    ticketRef.current = ticket;
  }, [ticket]);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    supportApi.get(ticketId).then((t) => {
      if (cancelled) return;
      setTicket(t);
      setTimeout(() => scrollToBottom("instant"), 50);
    }).catch(() => toast.error("Failed to load ticket"));
    return () => { cancelled = true; };
  }, [ticketId]);

  useEffect(() => {
    return subscribeToSupportTicket(ticketId, {
      onMessageSent: (id, message) => {
        if (id !== ticketId || optimisticIds.current.has(message.id)) return;

        const current = ticketRef.current;
        if (!current || current.messages.some((existing) => existing.id === message.id)) return;

        const next = { ...current, messages: [...current.messages, message] };
        setTicket(next);
        onTicketUpdate(next);

        if (message.senderType === "staff") {
          playNotificationSound();
          toast.success("Support replied to your ticket", { duration: 3000 });
        }

        scrollToBottom();
      },
      onStatusUpdated: (id, status) => {
        if (id !== ticketId) return;

        const current = ticketRef.current;
        if (!current) return;

        const next = { ...current, status };
        setTicket(next);
        onTicketUpdate(next);
      },
      onPriorityUpdated: (id, priority) => {
        if (id !== ticketId) return;

        const current = ticketRef.current;
        if (!current) return;

        const next = { ...current, priority };
        setTicket(next);
        onTicketUpdate(next);
      },
    });
  }, [ticketId, onTicketUpdate, scrollToBottom]);

  useEffect(() => {
    let cancelled = false;

    const interval = setInterval(async () => {
      try {
        const latest = await supportApi.get(ticketId);
        if (cancelled) return;

        if (hasNewIncomingMessage(ticketRef.current, latest)) {
          playNotificationSound();
          toast.success("Support replied to your ticket", { duration: 3000 });
        }

        setTicket(latest);
        onTicketUpdate(latest);
      } catch {}
    }, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [ticketId, onTicketUpdate]);

  // Scroll whenever messages change
  useEffect(() => { scrollToBottom(); }, [ticket?.messages.length]);

  const sendReply = async () => {
    const body = reply.trim();
    if ((!body && attachments.length === 0) || !ticket) return;
    setSending(true);
    const optimisticId = Date.now();
    if (body && attachments.length === 0) {
      const optimisticMsg: SupportMessage = {
        id: optimisticId,
        ticketId: ticket.id,
        customerId: null,
        body,
        senderType: "customer",
        senderName: user?.name ?? null,
        createdAt: new Date().toISOString(),
        attachments: [],
      };
      optimisticIds.current.add(optimisticId);
      setTicket((prev) => prev ? { ...prev, messages: [...prev.messages, optimisticMsg] } : prev);
    }
    const sentText = body;
    setReply("");
    setAttachments([]);
    scrollToBottom();

    try {
      const updated = await supportApi.reply(ticket.id, { body: sentText, attachments });
      // Replace optimistic with real messages from server
      setTicket(updated);
      onTicketUpdate(updated);
    } catch {
      setTicket((prev) => prev ? { ...prev, messages: prev.messages.filter((m) => m.id !== optimisticId) } : prev);
      setReply(sentText);
      setAttachments(attachments);
      toast.error("Failed to send message.");
    } finally {
      optimisticIds.current.delete(optimisticId);
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
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

  if (!ticket) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden" aria-label="Back">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Skeleton className="h-5 w-48" />
        </div>
        <Separator />
        <div className="flex-1 p-4 space-y-3">
          {[0,1,2].map(i => <Skeleton key={i} className="h-12 w-3/4" style={{ marginLeft: i % 2 === 0 ? 'auto' : undefined }} />)}
        </div>
      </div>
    );
  }

  const canReply = ticket.status !== "closed" && ticket.status !== "resolved";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="mt-0.5 md:hidden" aria-label="Back">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-mono">{ticket.ticketNumber}</span>
            <TicketStatusBadge status={ticket.status} />
          </div>
          <p className="font-semibold text-sm truncate mt-0.5">{ticket.subject}</p>
        </div>
      </div>
      <Separator />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {ticket.messages.length === 0 && (
          <EmptyState icon={MessageSquare} title="No messages yet. Send your first message below." className="p-6" />
        )}
        {ticket.messages.map((msg) => {
          const isCustomer = msg.senderType === "customer";
          return (
            <div key={msg.id} className={cn("flex flex-col gap-1", isCustomer ? "items-end" : "items-start")}>
              <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed", isCustomer
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm")}>
                {msg.body ? <p>{msg.body}</p> : null}
                <MessageAttachments attachments={msg.attachments} />
              </div>
              <span className="text-xs text-muted-foreground px-1">
                {isCustomer ? (user?.name ?? "You") : (msg.senderName ?? "Support Team")}
                {" · "}{relativeTime(msg.createdAt)}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {canReply ? (
        <>
        <Separator />
        <div className="shrink-0 p-3">
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt,.csv,.xls,.xlsx,.doc,.docx,audio/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <SelectedAttachments attachments={attachments} onRemove={removeAttachment} />
          <div className="flex gap-2 items-end">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0"
              aria-label="Attach files"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={handleVoiceToggle}
              className="shrink-0"
              aria-label={isRecording ? "Stop recording" : "Record voice note"}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Textarea
              ref={textareaRef}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type a message… (Enter to send)"
              className="flex-1 resize-none max-h-32 overflow-y-auto"
              style={{ minHeight: "42px" }}
            />
            <Button
              size="icon"
              onClick={sendReply}
              disabled={sending || (!reply.trim() && attachments.length === 0)}
              className="shrink-0"
              aria-label="Send message"
            >
              {sending ? <Spinner /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-1.5 ml-1">Shift+Enter for new line. Attach up to 5 files or record a voice note.</p>
        </div>
        </>
      ) : (
        <>
        <Separator />
        <div className="shrink-0 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            This ticket is <strong>{ticket.status}</strong>.{" "}
            <Link to="/support" onClick={onBack} className="underline hover:text-primary">Open a new ticket</Link> if you need further help.
          </p>
        </div>
        </>
      )}
    </div>
  );
}

// ── Ticket List Sidebar ───────────────────────────────────────────
function TicketListPanel({ tickets, selectedId, onSelect, loading, onNew }: {
  tickets: SupportTicket[]
  selectedId: number | null
  onSelect: (t: SupportTicket) => void
  loading: boolean
  onNew: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 shrink-0">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-primary" />
          <h1 className="font-bold text-base">Support</h1>
        </div>
        <Button size="sm" onClick={onNew}>
          <Plus className="w-3.5 h-3.5" /> New
        </Button>
      </div>
      <Separator />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-3 space-y-2">
            {[0,1,2].map(i => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No tickets yet. Create one to get help." className="h-full p-6" />
        ) : (
          <div className="p-2 space-y-1">
            {tickets.map((ticket) => {
              const isActive = ticket.id === selectedId;
              return (
                <Button
                  key={ticket.id}
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={() => onSelect(ticket)}
                  className="h-auto w-full flex-col items-stretch justify-start gap-0 text-left whitespace-normal"
                >
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <TicketStatusBadge status={ticket.status} />
                  </div>
                  <p className={cn("text-sm truncate font-medium", isActive ? "text-primary" : "text-foreground")}>
                    {ticket.subject}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {relativeTime(ticket.createdAt)} · {ticket.messages.length} msg
                  </p>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function Support() {
  const { isLoggedIn, isRestoring } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  // On mobile: null=list, number=chat, 'new'=form
  const [mobileView, setMobileView] = useState<"list" | "chat" | "new">("list");

  const loadTickets = useCallback(() => {
    if (!isLoggedIn || isRestoring) return;
    supportApi.getAll({ per_page: 50 })
      .then((res) => setTickets(res.data))
      .catch(() => {});
  }, [isLoggedIn, isRestoring]);

  // Initial load
  useEffect(() => {
    if (!isLoggedIn || isRestoring) return;
    setLoading(true);
    supportApi.getAll({ per_page: 50 })
      .then((res) => {
        setTickets(res.data);
        if (res.data.length > 0) setSelectedId(res.data[0].id);
      })
      .catch(() => toast.error("Failed to load tickets"))
      .finally(() => setLoading(false));
  }, [isLoggedIn, isRestoring]);

  // Silent list refresh every 30s
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(loadTickets, 30000);
    return () => clearInterval(interval);
  }, [loadTickets, isLoggedIn]);

  const handleCreated = (ticket: SupportTicket) => {
    setTickets((prev) => [ticket, ...prev]);
    setSelectedId(ticket.id);
    setShowNew(false);
    setMobileView("chat");
  };

  const handleSelect = (ticket: SupportTicket) => {
    setSelectedId(ticket.id);
    setShowNew(false);
    setMobileView("chat");
  };

  const handleTicketUpdate = useCallback((updated: SupportTicket) => {
    setTickets((prev) => prev.map((t) => t.id === updated.id ? updated : t));
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 pt-32 pb-16 flex items-center justify-center">
          <EmptyState
            icon={Headphones}
            title="Sign in to get support"
            description="Log in to submit tickets and message our support team."
            className="px-4"
            action={
              <div className="flex gap-3 justify-center">
                <Button asChild><Link to="/login">Sign In</Link></Button>
                <Button asChild variant="outline"><Link to="/contact">Contact Us</Link></Button>
              </div>
            }
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 pt-24 pb-8">
        <div className="container max-w-5xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Link to="/account" className="hover:text-primary">My Account</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Support</span>
          </div>

          {/* Split pane */}
          <Card className="overflow-hidden" style={{ height: "calc(100vh - 200px)", minHeight: "520px" }}>
            <div className="flex h-full">

              {/* LEFT: Ticket list — hidden on mobile when in chat/new */}
              <div className={cn("w-full md:w-72 md:flex flex-col border-r border-border shrink-0", mobileView !== "list" ? "hidden md:flex" : "flex")}>
                <TicketListPanel
                  tickets={tickets}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  loading={loading}
                  onNew={() => { setShowNew(true); setMobileView("new"); }}
                />
              </div>

              {/* RIGHT: Chat or new form */}
              <div className={cn("flex-1 flex flex-col min-w-0", mobileView === "list" ? "hidden md:flex" : "flex")}>
                <AnimatePresence mode="wait">
                  {showNew ? (
                    <motion.div key="new" className="flex-1 flex flex-col min-h-0"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.18 }}
                    >
                      <NewTicketForm
                        onCreated={handleCreated}
                        onCancel={() => { setShowNew(false); setMobileView("list"); }}
                      />
                    </motion.div>
                  ) : selectedId !== null ? (
                    <motion.div key={selectedId} className="flex-1 flex flex-col min-h-0"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <ChatPanel
                        ticketId={selectedId}
                        onBack={() => setMobileView("list")}
                        onTicketUpdate={handleTicketUpdate}
                      />
                    </motion.div>
                  ) : (
                    <motion.div key="empty" className="flex-1 flex flex-col items-center justify-center"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    >
                      <EmptyState icon={MessageSquare} title="Select a ticket or create a new one" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
