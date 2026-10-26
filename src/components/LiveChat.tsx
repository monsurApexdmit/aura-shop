import { cn } from "@/lib/utils"
import { useState, useRef, useEffect, useCallback, type ChangeEvent } from "react";
import { MessageCircle, X, Send, Minus, ExternalLink, Paperclip, Mic, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { UserAvatar } from "@/components/common/UserAvatar";
import { WithTooltip } from "@/components/common/WithTooltip";
import { useAuth } from "@/contexts/AuthContext";
import { supportApi, type SupportMessage, type TicketCategory } from "@/services/supportApi";
import { subscribeToSupportTicket, subscribeToGuestSupportTicket } from "@/lib/reverb";
import { Link } from "react-router-dom";
import { MessageAttachments, SelectedAttachments } from "@/components/SupportAttachments";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

const MotionCard = motion.create(Card);

// ─── Notification beep via Web Audio API (no sound file needed) ──────────────
function playNotificationBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => ctx.close();
  } catch { /* AudioContext blocked — silent fail */ }
}

// ─── Persisted session (survives page reload) ───────────────────────────────
const SESSION_KEY = "livechat_session";

interface ChatSession {
  ticketId: number;
  ticketNumber: string;
  guestToken?: string;    // only for guest
  isGuest: boolean;
}

function loadSession(): ChatSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as ChatSession) : null;
  } catch {
    return null;
  }
}

function saveSession(s: ChatSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ─── UI message shape ────────────────────────────────────────────────────────
interface UiMessage {
  id: string;
  text: string | null;
  sender: "user" | "staff" | "system";
  time: string;
  attachments: SupportMessage["attachments"];
}

function toUiMessage(m: SupportMessage): UiMessage {
  return {
    id: String(m.id),
    text: m.body,
    sender: m.senderType === "staff" ? "staff" : "user",
    time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    attachments: m.attachments,
  };
}

function systemMsg(text: string): UiMessage {
  return { id: `sys-${Date.now()}`, text, sender: "system", time: now(), attachments: [] };
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Quick reply options ─────────────────────────────────────────────────────
const quickReplies: { label: string; category: TicketCategory; subject: string }[] = [
  { label: "Track my order",  category: "order",    subject: "Track my order"    },
  { label: "Return policy",   category: "general",  subject: "Return policy"     },
  { label: "Payment issues",  category: "payment",  subject: "Payment issue"     },
  { label: "Talk to agent",   category: "general",  subject: "Talk to an agent"  },
];

// ─── Guest name/email prompt ─────────────────────────────────────────────────
interface GuestFormProps {
  initialText: string;
  onSubmit: (name: string, email: string) => void;
}

function GuestForm({ initialText, onSubmit }: GuestFormProps) {
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  return (
    <div className="p-4 space-y-3">
      <p className="text-sm text-muted-foreground">
        Before we connect you, please share your name and email so our team can follow up.
      </p>
      <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} aria-label="Your name" />
      <Input placeholder="Your email" type="email" value={email} onChange={e => setEmail(e.target.value)} aria-label="Your email" />
      <p className="text-xs text-muted-foreground italic truncate">Message: "{initialText}"</p>
      <Button
        className="w-full"
        disabled={!name.trim() || !email.trim()}
        onClick={() => onSubmit(name.trim(), email.trim())}
      >
        Start chat
      </Button>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function LiveChat() {
  const { isLoggedIn, user, isRestoring } = useAuth();

  const [open,      setOpen]      = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [unread,    setUnread]    = useState(0);

  // Chat state
  type Phase = "idle" | "guest_form" | "creating" | "chatting" | "resolved";
  const [phase,    setPhase]    = useState<Phase>("idle");
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input,    setInput]    = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending,  setSending]  = useState(false);
  const [session,  setSession]  = useState<ChatSession | null>(null);

  // Pending first message (held while showing guest form)
  const pendingText = useRef<string>("");
  const pendingAttachments = useRef<File[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const unsubRef  = useRef<(() => void) | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isRecording, start: startRecording, stop: stopRecording } = useVoiceRecorder();

  // ── Scroll to bottom on new messages ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phase]);

  // ── Focus input when open ──
  useEffect(() => {
    if (open && !minimized && phase === "chatting") {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, minimized, phase]);

  // ── Clear unread when window is open ──
  useEffect(() => {
    if (open && !minimized) setUnread(0);
  }, [open, minimized]);

  // ── Subscribe to real-time ticket channel ──
  const subscribeToTicket = useCallback((s: ChatSession) => {
    if (unsubRef.current) unsubRef.current();

    const handlers = {
      onMessageSent: (_tid: number, msg: SupportMessage) => {
        if (msg.senderType !== "staff") return;
        const ui = toUiMessage(msg);
        setMessages(prev => {
          if (prev.some(m => m.id === ui.id)) return prev;
          return [...prev, ui];
        });
        if (!open || minimized) setUnread(u => u + 1);
        playNotificationBeep();
      },
      onStatusUpdated: (_tid: number, status: string) => {
        if (status === "resolved" || status === "closed") {
          setPhase("resolved");
          setMessages(prev => [...prev, systemMsg("This conversation has been resolved. Thank you! 🎉")]);
        }
      },
    };

    const unsub = s.isGuest
      ? subscribeToGuestSupportTicket(s.ticketId, s.guestToken!, handlers)
      : subscribeToSupportTicket(s.ticketId, handlers);

    unsubRef.current = unsub;
  }, [open, minimized]);

  // ── Restore session on mount (after auth restores) ──
  useEffect(() => {
    if (isRestoring) return;
    const saved = loadSession();
    if (!saved) return;

    // If saved session is guest but user is now logged in → clear it
    if (saved.isGuest && isLoggedIn) {
      clearSession();
      return;
    }

    setSession(saved);
    setPhase("chatting");

    // Fetch messages for the saved session
    const load = async () => {
      try {
        const ticket = saved.isGuest
          ? await supportApi.getGuest(saved.ticketNumber, saved.guestToken!)
          : await supportApi.get(saved.ticketId);
        const msgs = ticket.messages.map(toUiMessage);
        setMessages(msgs);
        if (ticket.status === "resolved" || ticket.status === "closed") {
          setPhase("resolved");
        }
      } catch {
        // Stale session — clear it
        clearSession();
        setSession(null);
        setPhase("idle");
      }
    };
    load().then(() => subscribeToTicket(saved));
  }, [isRestoring, isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup on unmount ──
  useEffect(() => () => { unsubRef.current?.(); }, []);

  // ── Create ticket (logged-in) ──
  const createAuthTicket = async (text: string, category: TicketCategory = "general", files: File[] = []) => {
    setPhase("creating");
    try {
      const subject = (text.trim() || files[0]?.name || "New support request").substring(0, 80);
      const ticket = await supportApi.create({ subject, message: text, category, attachments: files });
      const s: ChatSession = { ticketId: ticket.id, ticketNumber: ticket.ticketNumber, isGuest: false };
      saveSession(s);
      setSession(s);
      setMessages(ticket.messages.map(toUiMessage));
      setAttachments([]);
      setPhase("chatting");
      subscribeToTicket(s);
    } catch {
      setMessages(prev => [...prev, systemMsg("Failed to start chat. Please try again.")]);
      setPhase("idle");
    }
  };

  // ── Create ticket (guest) ──
  const createGuestTicket = async (text: string, name: string, email: string, category: TicketCategory = "general", files: File[] = []) => {
    setPhase("creating");
    try {
      const subject = (text.trim() || files[0]?.name || "New support request").substring(0, 80);
      const res = await supportApi.contact({ name, email, subject, message: text, category, attachments: files });
      const s: ChatSession = {
        ticketId: res.ticket.id,
        ticketNumber: res.ticket.ticketNumber,
        guestToken: res.guestAccessToken,
        isGuest: true,
      };
      saveSession(s);
      setSession(s);
      setMessages(res.ticket.messages.map(toUiMessage));
      setAttachments([]);
      setPhase("chatting");
      subscribeToTicket(s);
    } catch {
      setMessages(prev => [...prev, systemMsg("Failed to start chat. Please try again.")]);
      setPhase("idle");
    }
  };

  // ── Send a reply to an existing ticket ──
  const sendReply = async (text: string, files: File[] = []) => {
    if ((!text.trim() && files.length === 0) || !session) return;
    setSending(true);
    if (text.trim() && files.length === 0) {
      const optimistic: UiMessage = { id: `opt-${Date.now()}`, text, sender: "user", time: now(), attachments: [] };
      setMessages(prev => [...prev, optimistic]);
    }
    setInput("");
    setAttachments([]);
    try {
      const updated = session.isGuest
        ? await supportApi.replyGuest(session.ticketNumber, session.guestToken!, { body: text, attachments: files })
        : await supportApi.reply(session.ticketId, { body: text, attachments: files });
      // Sync: replace optimistic with real messages
      setMessages(updated.messages.map(toUiMessage));
    } catch {
      setInput(text);
      setAttachments(files);
      setMessages(prev => [...prev, systemMsg("Failed to send. Please try again.")]);
    } finally {
      setSending(false);
    }
  };

  // ── Handle quick reply buttons ──
  const handleQuickReply = (q: typeof quickReplies[number]) => {
    if (isLoggedIn) {
      createAuthTicket(q.subject, q.category);
    } else {
      pendingText.current = q.subject;
      setPhase("guest_form");
    }
  };

  // ── Handle typed message send ──
  const handleSend = () => {
    const text = input.trim();
    if (!text && attachments.length === 0) return;

    if (phase === "chatting" && session) {
      sendReply(text, attachments);
      return;
    }

    if (phase === "idle") {
      if (isLoggedIn) {
        createAuthTicket(text, "general", attachments);
      } else {
        pendingText.current = text;
        pendingAttachments.current = attachments;
        setInput("");
        setAttachments([]);
        setPhase("guest_form");
      }
    }
  };

  // ── Guest form submit ──
  const handleGuestFormSubmit = (name: string, email: string) => {
    const text = pendingText.current;
    const files = pendingAttachments.current;
    pendingText.current = "";
    pendingAttachments.current = [];
    createGuestTicket(text, name, email, "general", files);
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
      await startRecording((file) => {
        setAttachments((prev) => [...prev, file].slice(0, 5));
      });
    } catch {
      setMessages((prev) => [...prev, systemMsg("Microphone access failed. Please allow microphone access and try again.")]);
    }
  };

  // ── Start new chat (after resolved) ──
  const handleNewChat = () => {
    unsubRef.current?.();
    clearSession();
    setSession(null);
    setMessages([]);
    setPhase("idle");
  };

  const isCreating = phase === "creating";

  return (
    <>
      {/* ── Floating button ── */}
      <AnimatePresence>
        {!open && (
          <WithTooltip content="Open chat"><Button asChild size="icon" className="fixed bottom-6 right-6 z-[100] size-14 rounded-full shadow-xl [&_svg]:size-6">
            <motion.button
              type="button"
              aria-label="Open chat"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setOpen(true); setMinimized(false); }}
            >
              <MessageCircle />
              {unread > 0 && (
                <Badge variant="destructive" className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1">
                  {unread > 9 ? "9+" : unread}
                </Badge>
              )}
              <span className="absolute inset-0 rounded-full gradient-primary animate-ping opacity-20" />
            </motion.button>
          </Button></WithTooltip>
        )}
      </AnimatePresence>

      {/* ── Chat window ── */}
      <AnimatePresence>
        {open && (
          <MotionCard
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={minimized
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-[100] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden flex flex-col"
            style={minimized ? { height: 56 } : { height: 500, maxHeight: "calc(100vh - 6rem)" }}
          >
            {/* Header */}
            <div
              className="gradient-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shrink-0 cursor-pointer"
              onClick={() => minimized && setMinimized(false)}
            >
              <div className="relative">
                <UserAvatar className="size-9" fallback={<MessageCircle className="h-4 w-4" />} />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-none">Customer Support</p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {phase === "creating" ? "Connecting…" : "We typically reply instantly"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {session && !minimized && (
                  <WithTooltip content="Open full support page">
                    <Button asChild variant="ghost" size="icon">
                      <Link
                        to={session.isGuest
                          ? `/support-guest/${session.ticketNumber}?token=${session.guestToken}`
                          : `/support`}
                        onClick={() => setOpen(false)}
                        aria-label="Open full support page"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </WithTooltip>
                )}
                <WithTooltip content="Minimize chat"><Button
                  variant="ghost"
                  size="icon"
                  aria-label="Minimize chat"
                  onClick={e => { e.stopPropagation(); setMinimized(m => !m); }}
                >
                  <Minus className="h-4 w-4" />
                </Button></WithTooltip>
                <WithTooltip content="Close chat"><Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close chat"
                  onClick={e => { e.stopPropagation(); setOpen(false); }}
                >
                  <X className="h-4 w-4" />
                </Button></WithTooltip>
              </div>
            </div>

            {/* Body */}
            {!minimized && (
              <>
                {/* ── Guest form ── */}
                {phase === "guest_form" && (
                  <GuestForm initialText={pendingText.current} onSubmit={handleGuestFormSubmit} />
                )}

                {/* ── Creating spinner ── */}
                {phase === "creating" && (
                  <div className="flex-1 flex items-center justify-center">
                    <Spinner className="size-5 text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Connecting…</span>
                  </div>
                )}

                {/* ── Messages ── */}
                {(phase === "idle" || phase === "chatting" || phase === "resolved") && (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
                      {/* Welcome message when idle */}
                      {phase === "idle" && messages.length === 0 && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                          <div className="max-w-[80%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm leading-relaxed bg-card text-card-foreground border border-border shadow-sm">
                            <p>Hi there! 👋 Welcome to StoreFront. How can I help you today?</p>
                            <p className="text-[10px] mt-1 text-muted-foreground">{now()}</p>
                          </div>
                        </motion.div>
                      )}

                      {/* Chat messages */}
                      {messages.map(msg => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn("flex", msg.sender === "user" ? "justify-end" : msg.sender === "system" ? "justify-center" : "justify-start")}
                        >
                          {msg.sender === "system" ? (
                            <Badge variant="secondary" className="font-normal text-muted-foreground">{msg.text}</Badge>
                          ) : (
                            <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed", msg.sender === "user"
                                ? "gradient-primary text-primary-foreground rounded-br-md"
                                : "bg-card text-card-foreground border border-border rounded-bl-md shadow-sm")}>
                              {msg.sender === "staff" && (
                                <p className="text-[10px] font-semibold text-primary mb-0.5">Support Agent</p>
                              )}
                              {msg.text ? <p>{msg.text}</p> : null}
                              <MessageAttachments attachments={msg.attachments} />
                              <p className={cn("text-[10px] mt-1", msg.sender === "user" ? "text-primary-foreground/60" : "text-muted-foreground")}>
                                {msg.time}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {/* Typing indicator while sending */}
                      {sending && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                          <div className="bg-primary/20 rounded-2xl rounded-br-md px-4 py-3">
                            <div className="flex gap-1">
                              {[0, 150, 300].map(d => (
                                <span key={d} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}ms` }} />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div ref={bottomRef} />
                    </div>

                    {/* Quick replies — only in idle before first message */}
                    {phase === "idle" && (
                      <div className="px-4 py-2 border-t border-border flex flex-wrap gap-1.5 bg-background">
                        {quickReplies.map(q => (
                          <Button
                            key={q.label}
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickReply(q)}
                          >
                            {q.label}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Resolved state — new chat button */}
                    {phase === "resolved" && (
                      <div className="px-4 py-3 border-t border-border bg-background text-center">
                        <p className="text-xs text-muted-foreground mb-2">Ticket resolved</p>
                        <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={handleNewChat}>
                          Start a new conversation
                        </Button>
                      </div>
                    )}

                    {/* Input — shown in idle and chatting */}
                    {(phase === "idle" || phase === "chatting") && (
                      <div className="p-3 border-t border-border bg-background shrink-0">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,.pdf,.txt,.csv,.xls,.xlsx,.doc,.docx,audio/*"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                        <SelectedAttachments attachments={attachments} onRemove={removeAttachment} />
                        <div className="mt-2 flex items-center gap-2">
                          <WithTooltip content="Attach files"><Button
                            size="icon"
                            variant="outline"
                            aria-label="Attach files"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isCreating || sending}
                            className="shrink-0"
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button></WithTooltip>
                          <WithTooltip content={isRecording ? "Stop recording" : "Record voice note"}><Button
                            size="icon"
                            variant={isRecording ? "destructive" : "outline"}
                            aria-label={isRecording ? "Stop recording" : "Record voice note"}
                            onClick={handleVoiceToggle}
                            disabled={isCreating || sending}
                            className="shrink-0"
                          >
                            {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </Button></WithTooltip>
                        <Input
                          ref={inputRef}
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                          placeholder={phase === "idle" ? "Type to start a conversation…" : "Type a message…"}
                          className="flex-1"
                          disabled={isCreating || sending}
                        />
                        <WithTooltip content="Send message"><Button
                          size="icon"
                          aria-label="Send message"
                          onClick={handleSend}
                          disabled={(!input.trim() && attachments.length === 0) || isCreating || sending}
                          className="shrink-0"
                        >
                          <Send className="h-4 w-4" />
                        </Button></WithTooltip>
                        </div>
                        <p className="mt-2 text-[11px] text-muted-foreground">Attach up to 5 files or record a voice note.</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </MotionCard>
        )}
      </AnimatePresence>
    </>
  );
}
