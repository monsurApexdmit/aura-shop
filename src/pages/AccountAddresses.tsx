import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, DemoAddress } from "@/contexts/AuthContext";
import { MapPin, ChevronRight, Plus, Trash2, Edit2, X, Check } from "lucide-react";
import { toast } from "sonner";
import Footer from "@/components/Footer";

const emptyAddr = { label: "", fullName: "", address: "", city: "", state: "", zip: "", phone: "", isDefault: false };

export default function AccountAddresses() {
  const { addresses, addAddress, updateAddress, removeAddress } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAddr);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = () => {
    if (!form.fullName || !form.address || !form.city || !form.zip) {
      toast.error("Please fill required fields");
      return;
    }
    if (editingId) {
      updateAddress(editingId, form);
      toast.success("Address updated!");
    } else {
      addAddress(form);
      toast.success("Address added!");
    }
    setForm(emptyAddr);
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (addr: DemoAddress) => {
    setForm({ label: addr.label, fullName: addr.fullName, address: addr.address, city: addr.city, state: addr.state, zip: addr.zip, phone: addr.phone, isDefault: addr.isDefault });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    removeAddress(id);
    toast.info("Address removed");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 pt-32 pb-16">
        <div className="container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
              <Link to="/account" className="hover:text-primary">My Account</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">Addresses</span>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h1 className="font-display font-bold text-2xl text-foreground">Address Book</h1>
              {!showForm && (
                <button onClick={() => { setForm(emptyAddr); setEditingId(null); setShowForm(true); }} className="gradient-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-lg">
                  <Plus className="h-3.5 w-3.5" /> Add Address
                </button>
              )}
            </div>

            {/* Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-display font-bold text-sm">{editingId ? "Edit Address" : "New Address"}</h2>
                      <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { name: "label", label: "Label (e.g. Home)", placeholder: "Home" },
                        { name: "fullName", label: "Full Name *", placeholder: "John Doe" },
                        { name: "address", label: "Address *", placeholder: "123 Main St", full: true },
                        { name: "city", label: "City *", placeholder: "New York" },
                        { name: "state", label: "State", placeholder: "NY" },
                        { name: "zip", label: "ZIP *", placeholder: "10001" },
                        { name: "phone", label: "Phone", placeholder: "+1 234-567-890" },
                      ].map((f) => (
                        <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">{f.label}</label>
                          <input name={f.name} value={(form as any)[f.name]} onChange={handleChange} placeholder={f.placeholder}
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <button onClick={() => setForm((f) => ({ ...f, isDefault: !f.isDefault }))}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.isDefault ? "bg-primary border-primary" : "border-border"}`}>
                        {form.isDefault && <Check className="h-3 w-3 text-primary-foreground" />}
                      </button>
                      <span className="text-sm text-muted-foreground">Set as default address</span>
                    </div>
                    <button onClick={handleSave} className="mt-5 gradient-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg">
                      {editingId ? "Update Address" : "Save Address"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Address Cards */}
            {addresses.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <MapPin className="h-14 w-14 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No addresses saved yet</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <motion.div key={addr.id} layout className="bg-card border border-border rounded-2xl p-5 relative">
                    {addr.isDefault && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">Default</span>
                    )}
                    {addr.label && <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{addr.label}</p>}
                    <p className="font-semibold text-sm text-foreground">{addr.fullName}</p>
                    <p className="text-sm text-muted-foreground">{addr.address}</p>
                    <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zip}</p>
                    {addr.phone && <p className="text-xs text-muted-foreground mt-1">{addr.phone}</p>}
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => startEdit(addr)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                        <Edit2 className="h-3 w-3" /> Edit
                      </button>
                      <button onClick={() => handleDelete(addr.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors">
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
