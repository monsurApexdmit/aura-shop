import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Headphones, FileQuestion } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().min(3, "Subject is required").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

type ContactData = z.infer<typeof contactSchema>;

const contactInfo = [
  { icon: Phone, label: "Phone", value: "+1 234-567-890", href: "tel:+1234567890", detail: "Mon-Fri, 9am-6pm EST" },
  { icon: Mail, label: "Email", value: "support@shopvibe.com", href: "mailto:support@shopvibe.com", detail: "We reply within 24 hours" },
  { icon: MapPin, label: "Address", value: "123 Commerce Street, New York, NY 10001", href: "#", detail: "Visit our office" },
  { icon: Clock, label: "Business Hours", value: "Mon-Fri: 9AM-6PM EST", href: "#", detail: "Weekends: 10AM-4PM" },
];

const topics = [
  { icon: Headphones, label: "Order Support", description: "Track, modify, or return your orders" },
  { icon: MessageSquare, label: "Product Inquiry", description: "Questions about our products" },
  { icon: FileQuestion, label: "General Question", description: "Anything else we can help with" },
];

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function Contact() {
  const [form, setForm] = useState<ContactData>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => { fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 1200);
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
          </motion.div>
        </div>
      </section>
    </div>
  );
}
