import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { User, ChevronRight, Save } from "lucide-react";
import { toast } from "sonner";
import Footer from "@/components/Footer";

export default function AccountProfile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    toast.success("Profile updated! (Demo)");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 pt-32 pb-16">
        <div className="container max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
              <Link to="/account" className="hover:text-primary">My Account</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">Profile</span>
            </div>

            <h1 className="font-display font-bold text-2xl text-foreground mb-6">Profile Settings</h1>

            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-foreground">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Member since {new Date(user?.joinedDate || "").toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                {[
                  { label: "Full Name", value: name, set: setName, type: "text", placeholder: "John Doe" },
                  { label: "Email Address", value: email, set: setEmail, type: "email", placeholder: "john@example.com" },
                  { label: "Phone Number", value: phone, set: setPhone, type: "tel", placeholder: "+1 234-567-890" },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">{field.label}</label>
                    <input
                      type={field.type}
                      value={field.value}
                      onChange={(e) => field.set(e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                ))}

                <button type="submit" className="gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg">
                  <Save className="h-4 w-4" /> Save Changes
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
