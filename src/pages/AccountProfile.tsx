import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { User, ChevronRight, Save } from "lucide-react";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useTranslation } from "react-i18next";

/** Error shape from the API client (axios) */
type ApiErr = { response?: { data?: { message?: string } } };

export default function AccountProfile() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error(t("account:profile.required"));
      return;
    }
    try {
      setSaving(true);
      await updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined });
      toast.success(t("account:profile.updated"));
    } catch (e) {
      const err = e as ApiErr;
      toast.error(err?.response?.data?.message || t("account:profile.failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 pt-32 pb-16">
        <div className="container max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
              <Link to="/account" className="hover:text-primary">{t("common:nav.myAccount")}</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{t("account:breadcrumb.profile")}</span>
            </div>

            <PageHeader title={t("account:profile.title")} className="mb-6" />

            <Card className="p-6 sm:p-8">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <UserAvatar name={user?.name} fallback={<User className="h-8 w-8" />} className="size-16" />
                <div>
                  <p className="font-semibold text-lg">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{user?.city ? `${user.city}${user.country ? `, ${user.country}` : ""}` : t("account:profile.noLocation")}</p>
                </div>
              </div>
              <Separator className="mt-6 mb-8" />

              <form onSubmit={handleSave} className="space-y-5">
                {[
                  { label: t("account:profile.fullName"), value: name, set: setName, type: "text", placeholder: t("account:signup.namePlaceholder") },
                  { label: t("account:profile.email"), value: email, set: setEmail, type: "email", placeholder: "john@example.com" },
                  { label: t("account:profile.phone"), value: phone, set: setPhone, type: "tel", placeholder: t("account:profile.phonePlaceholder") },
                ].map((field) => (
                  <FormField key={field.type} label={field.label} htmlFor={`profile-${field.type}`}>
                    <Input
                      id={`profile-${field.type}`}
                      type={field.type}
                      value={field.value}
                      onChange={(e) => field.set(e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full"
                    />
                  </FormField>
                ))}

                <Button type="submit" disabled={saving}>
                  {saving ? <Spinner /> : <Save className="h-4 w-4" />}
                  {saving ? t("account:profile.saving") : t("account:profile.save")}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
