import { cn } from "@/lib/utils"
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, Send, XCircle, Paperclip, Mic, Square } from "lucide-react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/common/PageHeader";
import { FormField } from "@/components/common/FormField";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Textarea } from "@/components/ui/textarea";
import { supportApi, type SupportTicket } from "@/services/supportApi";
import { subscribeToGuestSupportTicket } from "@/lib/reverb";
import { MessageAttachments, SelectedAttachments } from "@/components/SupportAttachments";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import i18n, { localeTag } from "@/i18n";

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
  } catch {
    /* audio not available */
  }
}

const STATUS_ICON = {
  open:        AlertCircle,
  in_progress: Clock,
  resolved:    CheckCircle2,
  closed:      XCircle,
} as const;

/** Error text the API sent back, if any */
const apiMessage = (err: unknown): string | undefined =>
  (err as { response?: { data?: { message?: string } } } | null)?.response?.data?.message;

/** The guest endpoint also returns who opened the ticket */
type GuestTicket = SupportTicket & { customerName?: string | null; customerEmail?: string | null };

function TicketStatusBadge({ status }: { status: SupportTicket["status"] }) {
  const { t } = useTranslation();
  const Icon = STATUS_ICON[status] ?? AlertCircle;
  return (
    <StatusBadge
      status={status}
      className="gap-1"
      label={<><Icon className="w-3 h-3" /> {t(`support:status.${status}`, { defaultValue: status })}</>}
    />
  );
}

function relativeTime(dateStr: string, t: TFunction): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return t("support:time.justNow");
  if (m < 60) return t("support:time.minutesAgo", { n: m });
  if (h < 24) return t("support:time.hoursAgo", { n: h });
  if (d === 1) return t("support:time.yesterday");
  return new Date(dateStr).toLocaleString(localeTag());
}

function hasNewStaffMessage(previous: SupportTicket | null, next: SupportTicket): boolean {
  if (!previous) return false;

  return next.messages.some((message) => {
    if (message.senderType !== "staff") return false;
    return !previous.messages.some((existing) => existing.id === message.id);
  });
}

export default function GuestSupport() {
  const { t } = useTranslation();
  const { ticketNumber = "" } = useParams<{ ticketNumber: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [ticket, setTicket] = useState<GuestTicket | null>(null);
  const [reply, setReply] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ticketRef = useRef<GuestTicket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isRecording, start: startRecording, stop: stopRecording } = useVoiceRecorder();

  const canReply = useMemo(() => ticket && ticket.status !== "closed", [ticket]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const loadTicket = useCallback(async (silent = false) => {
    if (!ticketNumber || !token) {
      setError(i18n.t("support:guest.invalidLink"));
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);
    try {
      const next = await supportApi.getGuest(ticketNumber, token);
      if (hasNewStaffMessage(ticketRef.current, next)) {
        playNotificationSound();
        toast.success(i18n.t("support:guest.replied"));
      }
      ticketRef.current = next;
      setTicket(next);
      setError(null);
    } catch (err) {
      setError(apiMessage(err) || i18n.t("support:guest.loadFailed"));
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
          toast.success(i18n.t("support:guest.replied"));
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
      toast.success(t("support:guest.replySent"));
    } catch (err) {
      toast.error(apiMessage(err) || t("support:guest.replyFailed"));
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
      toast.error(t("support:micFailed"));
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28">
      <div className="container pb-16">
        <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">{t("support:guest.kicker")}</p>
        <PageHeader
          className="mb-6"
          title={t("support:guest.title")}
          actions={
            <Button asChild variant="outline">
              <Link to="/contact">
                <ArrowLeft className="w-4 h-4" />
                {t("support:guest.backToContact")}
              </Link>
            </Button>
          }
        />

        {loading ? (
          <Card className="p-10 text-center text-muted-foreground">
            <Spinner className="mx-auto mb-3 size-5" />
            {t("support:guest.loading")}
          </Card>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("support:guest.errorTitle")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : ticket ? (
          <Card className="overflow-hidden">
            <div className="px-6 py-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{ticket.ticketNumber}</p>
                  <h2 className="mt-1 text-xl font-semibold text-foreground">{ticket.subject}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("support:guest.meta", {
                      name: ticket.customerName || t("support:guest.guestName"),
                      email: ticket.customerEmail || t("support:guest.noEmail"),
                      time: relativeTime(ticket.createdAt, t),
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <TicketStatusBadge status={ticket.status} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void loadTicket(true)}
                  >
                    {t("support:guest.refresh")}
                  </Button>
                </div>
              </div>
            </div>
            <Separator />

            <div className="max-h-[480px] overflow-y-auto px-6 py-5 space-y-4">
              {ticket.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("max-w-[85%] rounded-2xl px-4 py-3", message.senderType === "staff"
                      ? "bg-primary/10 text-foreground"
                      : "ml-auto bg-muted text-foreground")}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {message.senderType === "staff" ? (message.senderName || t("support:supportTeam")) : t("support:you")}
                    </p>
                    <span className="text-[11px] text-muted-foreground">{relativeTime(message.createdAt, t)}</span>
                  </div>
                  {message.body ? <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.body}</p> : null}
                  <MessageAttachments attachments={message.attachments} />
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <Separator />
            <div className="px-6 py-5">
              {canReply ? (
                <div className="space-y-3">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.txt,.csv,.xls,.xlsx,.doc,.docx,audio/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <FormField label={t("support:guest.replyLabel")} htmlFor="guest-support-reply">
                    <SelectedAttachments attachments={attachments} onRemove={removeAttachment} />
                    <Textarea
                      id="guest-support-reply"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={4}
                      placeholder={t("support:guest.replyPlaceholder")}
                      className="w-full resize-none"
                    />
                  </FormField>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="w-4 h-4" />
                        {t("support:attach")}
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={handleVoiceToggle}>
                        {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        {isRecording ? t("support:stop") : t("support:voice")}
                      </Button>
                    </div>
                    <Button
                      onClick={sendReply}
                      disabled={sending || (!reply.trim() && attachments.length === 0)}
                    >
                      {sending ? <Spinner /> : <Send className="w-4 h-4" />}
                      {t("support:guest.sendReply")}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("support:guest.closed")}</p>
              )}
            </div>
          </Card>
        ) : null}
      </div>
      <Footer />
    </div>
  );
}
