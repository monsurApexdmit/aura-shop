import { cn } from "@/lib/utils"
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Headphones, FileQuestion } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supportApi, type SupportTicket, type TicketCategory } from "@/services/supportApi";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { FormField } from "@/components/common/FormField";
import { SectionTitle } from "@/components/common/SectionTitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const inputClass = (field: string) => (errors[field] ? "border-destructive" : undefined);

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
            <motion.div key={t.label} {...fadeUp} transition={{ delay: i * 0.1 }}>
              <Item variant="outline" className="h-full items-start">
                <ItemMedia variant="icon">
                  <t.icon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{t.label}</ItemTitle>
                  <ItemDescription className="text-xs">{t.description}</ItemDescription>
                </ItemContent>
              </Item>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form + Info */}
      <section className="container">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <motion.div {...fadeUp} className="lg:col-span-3">
            <Card className="p-6 sm:p-8">
              <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" /> Send a Message
              </h2>
              {submittedTicket && (
                <Alert className="mb-6">
                  <AlertTitle>Message received</AlertTitle>
                  <AlertDescription className="text-muted-foreground">
                    Ticket <span className="font-medium text-foreground">{submittedTicket.ticketNumber}</span> has been created. Our team will follow up soon.
                  </AlertDescription>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {isLoggedIn ? (
                      <Button asChild variant="link" className="h-auto p-0">
                        <Link to="/support">Open support center</Link>
                      </Button>
                    ) : submittedTicket && guestAccessToken ? (
                      <Button asChild variant="link" className="h-auto p-0">
                        <Link to={`/support/guest/${submittedTicket.ticketNumber}?token=${encodeURIComponent(guestAccessToken)}`}>
                          Track this conversation
                        </Link>
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => { setSubmittedTicket(null); setGuestAccessToken(""); }}
                      className="h-auto p-0"
                    >
                      Send another message
                    </Button>
                  </div>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Name" htmlFor="contact-name" error={errors.name}>
                    <Input id="contact-name" name="name" value={form.name} onChange={handleChange} placeholder="Your name" className={inputClass("name")} />
                  </FormField>
                  <FormField label="Email" htmlFor="contact-email" error={errors.email}>
                    <Input id="contact-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" className={inputClass("email")} />
                  </FormField>
                </div>
                <FormField label="Topic" htmlFor="contact-topic">
                  <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as TicketCategory)}>
                    <SelectTrigger id="contact-topic" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order">Order Support</SelectItem>
                      <SelectItem value="product">Product Inquiry</SelectItem>
                      <SelectItem value="payment">Payment Issue</SelectItem>
                      <SelectItem value="shipping">Shipping Problem</SelectItem>
                      <SelectItem value="general">General Question</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Subject" htmlFor="contact-subject" error={errors.subject}>
                  <Input id="contact-subject" name="subject" value={form.subject} onChange={handleChange} placeholder="What's this about?" className={inputClass("subject")} />
                </FormField>
                <FormField label="Message" htmlFor="contact-message" error={errors.message}>
                  <Textarea id="contact-message" name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Tell us more..." className={cn(inputClass("message"), "resize-none")} />
                </FormField>
                <Button type="submit" disabled={sending}>
                  {sending ? "Sending..." : "Send Message"} <Send className="h-4 w-4" />
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-4">
            {contactInfo.map((info) => (
              <Item key={info.label} asChild variant="outline" className="items-start">
                <a href={info.href}>
                  <ItemMedia variant="icon">
                    <info.icon />
                  </ItemMedia>
                  <ItemContent className="gap-0.5">
                    <SectionTitle as="p">{info.label}</SectionTitle>
                    <ItemTitle>{info.value}</ItemTitle>
                    <ItemDescription className="text-xs">{info.detail}</ItemDescription>
                  </ItemContent>
                </a>
              </Item>
            ))}

            {Object.keys(storeHours).length > 0 && (
              <Item variant="outline" className="items-start">
                <ItemMedia variant="icon">
                  <Clock />
                </ItemMedia>
                <ItemContent className="min-w-0">
                  <SectionTitle as="p" className="mb-1">Business Hours</SectionTitle>
                  <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
                    {["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].map((day) => {
                      const h = storeHours[day];
                      if (!h) return null;
                      return (
                        <React.Fragment key={day}>
                          <span className={cn("text-sm font-medium capitalize", h.isOpen ? "text-foreground" : "text-muted-foreground/50")}>
                            {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                          </span>
                          <span className={cn("text-sm", h.isOpen ? "text-muted-foreground" : "text-muted-foreground/40 italic")}>
                            {h.isOpen ? `${h.open} – ${h.close}` : "Closed"}
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </ItemContent>
              </Item>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
