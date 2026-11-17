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
import { Trans, useTranslation } from "react-i18next";
import { localeTag } from "@/i18n";

// Validation messages are translation keys, translated when shown
const TOO_LONG = "pages:contact.validation.tooLong";
const contactSchema = z.object({
  name: z.string().trim().min(2, "pages:contact.validation.nameRequired").max(100, TOO_LONG),
  email: z.string().trim().email("pages:contact.validation.emailInvalid").max(255, TOO_LONG),
  subject: z.string().trim().min(3, "pages:contact.validation.subjectRequired").max(200, TOO_LONG),
  message: z.string().trim().min(10, "pages:contact.validation.messageMin").max(1000, TOO_LONG),
});

type ContactData = { name: string; email: string; subject: string; message: string };

const topics = [
  { icon: Headphones, labelKey: "support:category.order", descriptionKey: "pages:contact.topics.orderDescription" },
  { icon: MessageSquare, labelKey: "support:category.product", descriptionKey: "pages:contact.topics.productDescription" },
  { icon: FileQuestion, labelKey: "support:category.general", descriptionKey: "pages:contact.topics.generalDescription" },
];

const CATEGORIES: TicketCategory[] = ["order", "product", "payment", "shipping", "general"];
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
// Short weekday name in the current language (1 Jan 2024 was a Monday)
const dayName = (i: number) => new Date(2024, 0, 1 + i).toLocaleDateString(localeTag(), { weekday: "short" });

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function Contact() {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const { storePhone, storeEmail, storeAddress, storeHours } = useCurrency();

  const contactInfo = [
    storePhone && { icon: Phone, label: t("common:form.phone"), value: storePhone, href: `tel:${storePhone}`, detail: t("pages:contact.info.phoneDetail") },
    storeEmail && { icon: Mail, label: t("common:form.email"), value: storeEmail, href: `mailto:${storeEmail}`, detail: t("pages:contact.info.emailDetail") },
    storeAddress && { icon: MapPin, label: t("common:form.address"), value: storeAddress, href: "#", detail: t("pages:contact.info.addressDetail") },
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
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        category: selectedCategory,
      });
      setSubmittedTicket(result.ticket);
      setGuestAccessToken(result.guestAccessToken);
      toast.success(t("pages:contact.success"));
      setForm({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    } catch (err) {
      const apiMessage = (err as { response?: { data?: { message?: string } } } | null)?.response?.data?.message;
      toast.error(apiMessage || t("pages:contact.failed"));
    } finally {
      setSending(false);
    }
  };

  const inputClass = (field: string) => (errors[field] ? "border-destructive" : undefined);
  const errorText = (field: string) => (errors[field] ? t(errors[field]) : undefined);

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      {/* Hero */}
      <section className="container text-center mb-16">
        <motion.p {...fadeUp} className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">{t("pages:contact.kicker")}</motion.p>
        <motion.h1 {...fadeUp} transition={{ delay: 0.1 }} className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-5">
          {t("pages:contact.title")}
        </motion.h1>
        <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-muted-foreground max-w-xl mx-auto">
          {t("pages:contact.subtitle")}
        </motion.p>
      </section>

      {/* Quick Topics */}
      <section className="container mb-12">
        <div className="grid sm:grid-cols-3 gap-4">
          {topics.map((topic, i) => (
            <motion.div key={topic.labelKey} {...fadeUp} transition={{ delay: i * 0.1 }}>
              <Item variant="outline" className="h-full items-start">
                <ItemMedia variant="icon">
                  <topic.icon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{t(topic.labelKey)}</ItemTitle>
                  <ItemDescription className="text-xs">{t(topic.descriptionKey)}</ItemDescription>
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
                <Send className="h-5 w-5 text-primary" /> {t("pages:contact.formTitle")}
              </h2>
              {submittedTicket && (
                <Alert className="mb-6">
                  <AlertTitle>{t("pages:contact.received.title")}</AlertTitle>
                  <AlertDescription className="text-muted-foreground">
                    <Trans
                      i18nKey="pages:contact.received.text"
                      values={{ ticket: submittedTicket.ticketNumber }}
                      components={{ strong: <span className="font-medium text-foreground" /> }}
                    />
                  </AlertDescription>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {isLoggedIn ? (
                      <Button asChild variant="link" className="h-auto p-0">
                        <Link to="/support">{t("pages:contact.received.openSupport")}</Link>
                      </Button>
                    ) : submittedTicket && guestAccessToken ? (
                      <Button asChild variant="link" className="h-auto p-0">
                        <Link to={`/support/guest/${submittedTicket.ticketNumber}?token=${encodeURIComponent(guestAccessToken)}`}>
                          {t("pages:contact.received.track")}
                        </Link>
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => { setSubmittedTicket(null); setGuestAccessToken(""); }}
                      className="h-auto p-0"
                    >
                      {t("pages:contact.received.sendAnother")}
                    </Button>
                  </div>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label={t("common:form.name")} htmlFor="contact-name" error={errorText("name")}>
                    <Input id="contact-name" name="name" value={form.name} onChange={handleChange} placeholder={t("pages:contact.namePlaceholder")} className={inputClass("name")} />
                  </FormField>
                  <FormField label={t("common:form.email")} htmlFor="contact-email" error={errorText("email")}>
                    <Input id="contact-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder={t("pages:contact.emailPlaceholder")} className={inputClass("email")} />
                  </FormField>
                </div>
                <FormField label={t("pages:contact.topic")} htmlFor="contact-topic">
                  <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as TicketCategory)}>
                    <SelectTrigger id="contact-topic" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{t(`support:category.${c}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label={t("support:form.subject")} htmlFor="contact-subject" error={errorText("subject")}>
                  <Input id="contact-subject" name="subject" value={form.subject} onChange={handleChange} placeholder={t("pages:contact.subjectPlaceholder")} className={inputClass("subject")} />
                </FormField>
                <FormField label={t("common:form.message")} htmlFor="contact-message" error={errorText("message")}>
                  <Textarea id="contact-message" name="message" value={form.message} onChange={handleChange} rows={5} placeholder={t("pages:contact.messagePlaceholder")} className={cn(inputClass("message"), "resize-none")} />
                </FormField>
                <Button type="submit" disabled={sending}>
                  {sending ? t("pages:contact.sending") : t("pages:contact.send")} <Send className="h-4 w-4" />
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
                  <SectionTitle as="p" className="mb-1">{t("pages:contact.hours")}</SectionTitle>
                  <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
                    {DAYS.map((day, dayIndex) => {
                      const h = storeHours[day];
                      if (!h) return null;
                      return (
                        <React.Fragment key={day}>
                          <span className={cn("text-sm font-medium capitalize", h.isOpen ? "text-foreground" : "text-muted-foreground/50")}>
                            {dayName(dayIndex)}
                          </span>
                          <span className={cn("text-sm", h.isOpen ? "text-muted-foreground" : "text-muted-foreground/40 italic")}>
                            {h.isOpen ? `${h.open} – ${h.close}` : t("common:time.closed")}
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
