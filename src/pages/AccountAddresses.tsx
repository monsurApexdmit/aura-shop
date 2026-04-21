import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressApi, type AddressPayload } from "@/services/addressApi";
import { MapPin, ChevronRight, Plus, Trash2, Edit2, X, Check, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Footer from "@/components/Footer";

const emptyForm: AddressPayload = {
  full_name: "", phone: "", email: "", address_line1: "", address_line2: "",
  city: "", state: "", postal_code: "", country: "", address_type: "home", is_default: false,
};

export default function AccountAddresses() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AddressPayload>(emptyForm);

  // Remove stale localStorage-based addresses from previous implementation
  useState(() => { localStorage.removeItem("customer_addresses"); });

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["customer-addresses"],
    queryFn: addressApi.list,
  });

  const createMutation = useMutation({
    mutationFn: addressApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-addresses"] });
      toast.success("Address added!");
      closeForm();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to add address"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AddressPayload> }) =>
      addressApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-addresses"] });
      toast.success("Address updated!");
      closeForm();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update address"),
  });

  const deleteMutation = useMutation({
    mutationFn: addressApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-addresses"] });
      toast.info("Address removed");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to delete address"),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = () => {
    if (!form.full_name.trim() || !form.address_line1.trim()) {
      toast.error("Full name and address are required");
      return;
    }
    const payload = { ...form };
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const startEdit = (addr: (typeof addresses)[0]) => {
    setForm({
      full_name: addr.full_name,
      phone: addr.phone ?? "",
      email: addr.email ?? "",
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 ?? "",
      city: addr.city ?? "",
      state: addr.state ?? "",
      postal_code: addr.postal_code ?? "",
      country: addr.country ?? "",
      address_type: addr.address_type,
      is_default: addr.is_default,
    });
    setEditingId(addr.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

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
                <button
                  onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}
                  className="gradient-primary text-primary-foreground px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-lg"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Address
                </button>
              )}
            </div>

            {/* Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-display font-bold text-sm">{editingId ? "Edit Address" : "New Address"}</h2>
                      <button onClick={closeForm} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { name: "full_name", label: "Full Name *", placeholder: "John Doe" },
                        { name: "phone", label: "Phone", placeholder: "+1 234-567-890" },
                        { name: "address_line1", label: "Address Line 1 *", placeholder: "123 Main St", full: true },
                        { name: "address_line2", label: "Address Line 2", placeholder: "Apt 4B", full: true },
                        { name: "city", label: "City", placeholder: "New York" },
                        { name: "state", label: "State / Province", placeholder: "NY" },
                        { name: "postal_code", label: "ZIP / Postal Code", placeholder: "10001" },
                        { name: "country", label: "Country", placeholder: "United States" },
                      ].map((f) => (
                        <div key={f.name} className={(f as any).full ? "sm:col-span-2" : ""}>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">{f.label}</label>
                          <input
                            name={f.name}
                            value={(form as any)[f.name]}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          />
                        </div>
                      ))}

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Address Type</label>
                        <select
                          name="address_type"
                          value={form.address_type}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => setForm((f) => ({ ...f, is_default: !f.is_default }))}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.is_default ? "bg-primary border-primary" : "border-border"}`}
                      >
                        {form.is_default && <Check className="h-3 w-3 text-primary-foreground" />}
                      </button>
                      <span className="text-sm text-muted-foreground">Set as default address</span>
                    </div>

                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="gradient-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2 disabled:opacity-70"
                      >
                        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        {editingId ? "Update Address" : "Save Address"}
                      </button>
                      <button onClick={closeForm} className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Address Cards */}
            {isLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <MapPin className="h-14 w-14 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No addresses saved yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-sm text-primary font-semibold hover:underline mt-2 inline-block"
                >
                  Add your first address
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <motion.div key={addr.id} layout className="bg-card border border-border rounded-2xl p-5 relative">
                    {addr.is_default && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">Default</span>
                    )}
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 capitalize">{addr.address_type}</p>
                    <p className="font-semibold text-sm text-foreground">{addr.full_name}</p>
                    <p className="text-sm text-muted-foreground">{addr.address_line1}</p>
                    {addr.address_line2 && <p className="text-sm text-muted-foreground">{addr.address_line2}</p>}
                    <p className="text-sm text-muted-foreground">
                      {[addr.city, addr.state, addr.postal_code].filter(Boolean).join(", ")}
                    </p>
                    {addr.country && <p className="text-sm text-muted-foreground">{addr.country}</p>}
                    {addr.phone && <p className="text-xs text-muted-foreground mt-1">{addr.phone}</p>}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => startEdit(addr)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                      >
                        <Edit2 className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(addr.id)}
                        disabled={deleteMutation.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50"
                      >
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
