import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Headphones, FileQuestion } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supportApi, type SupportTicket, type TicketCategory } from "@/services/supportApi";
import { useCurrency } from "@/contexts/CurrencyContext";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().min(3, "Subject is required").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

type ContactData = z.infer<typeof contactSchema>;


const topics = [
  { icon: Headphones, label: "Order Support", description: "Track, modify, or return your orders" },
  { icon: MessageSquare, label: "Product Inquiry", description: "Questions about our products" },
  { icon: FileQuestion, label: "General Question", description: "Anything else we can help with" },
];

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function Contact() {
  const { isLoggedIn } = useAuth();
  const { storePhone, storeEmail, storeAddress, storeHours } = useCurrency();

  const contactInfo = [
    storePhone && { icon: Phone, label: "Phone", value: storePhone, href: `tel:${storePhone}`, detail: "Call us anytime" },
    storeEmail && { icon: Mail, label: "Email", value: storeEmail, href: `mailto:${storeEmail}`, detail: "We reply within 24 hours" },
    storeAddress && { icon: MapPin, label: "Address", value: storeAddress, href: "#", detail: "Visit our office" },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string; href: string; detail: string }[];
  const [form, setForm] = useState<ContactData>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory>("general");
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);
  const [guestAccessToken, setGuestAccessToken] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => { fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      return;
    }
    setSending(true);
    try {
      const result = await supportApi.contact({
        ...form,
        category: selectedCategory,
      });
      setSubmittedTicket(result.ticket);
      setGuestAccessToken(result.guestAccessToken);
      toast.success("Message sent! Our team has received your request.");
      setForm({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send your message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border bg-muted/30 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
      errors[field] ? "border-destructive" : "border-border"
    }`;

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      {/* Hero */}
      <section className="container text-center mb-16">
        <motion.p {...fadeUp} className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">Get in Touch</motion.p>
        <motion.h1 {...fadeUp} transition={{ delay: 0.1 }} className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-5">
          We'd Love to Hear From You
        </motion.h1>
        <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-xl mx-auto">
          Have a question, feedback, or need help? Our team is here for you.
        </motion.p>
      </section>

      {/* Quick Topics */}
      <section className="container mb-12">
        <div className="grid sm:grid-cols-3 gap-4">
          {topics.map((t, i) => (
            <motion.div key={t.label} {...fadeUp} transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4 hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <t.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-foreground">{t.label}</h3>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form + Info */}
      <section className="container">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <motion.div {...fadeUp} className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" /> Send a Message
              </h2>
              {submittedTicket && (
                <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <p className="font-semibold text-foreground">Message received</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ticket <span className="font-medium text-foreground">{submittedTicket.ticketNumber}</span> has been created. Our team will follow up soon.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {isLoggedIn ? (
                      <Link to="/support" className="text-sm font-medium text-primary hover:underline">
                        Open support center
                      </Link>
                    ) : submittedTicket && guestAccessToken ? (
                      <Link
                        to={`/support/guest/${submittedTicket.ticketNumber}?token=${encodeURIComponent(guestAccessToken)}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Track this conversation
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => { setSubmittedTicket(null); setGuestAccessToken(""); }}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      Send another message
                    </button>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Name</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" className={inputClass("name")} />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" className={inputClass("email")} />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Topic</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as TicketCategory)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  >
                    <option value="order">Order Support</option>
                    <option value="product">Product Inquiry</option>
                    <option value="payment">Payment Issue</option>
                    <option value="shipping">Shipping Problem</option>
                    <option value="general">General Question</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Subject</label>
                  <input name="subject" value={form.subject} onChange={handleChange} placeholder="What's this about?" className={inputClass("subject")} />
                  {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Tell us more..." className={`${inputClass("message")} resize-none`} />
                  {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="gradient-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send Message"} <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-4">
            {contactInfo.map((info) => (
              <a key={info.label} href={info.href}
                className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4 hover:border-primary/30 transition-colors block"
              >
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <info.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{info.label}</p>
                  <p className="font-medium text-foreground text-sm">{info.value}</p>
                  <p className="text-xs text-muted-foreground">{info.detail}</p>
                </div>
              </a>
            ))}

            {Object.keys(storeHours).length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4 hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Business Hours</p>
                  <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
                    {["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].map((day) => {
                      const h = storeHours[day];
                      if (!h) return null;
                      return (
                        <React.Fragment key={day}>
                          <span className={`text-sm font-medium capitalize ${h.isOpen ? "text-foreground" : "text-muted-foreground/50"}`}>
                            {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                          </span>
                          <span className={`text-sm ${h.isOpen ? "text-muted-foreground" : "text-muted-foreground/40 italic"}`}>
                            {h.isOpen ? `${h.open} – ${h.close}` : "Closed"}
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
