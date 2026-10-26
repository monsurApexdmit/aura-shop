import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressApi, type AddressPayload } from "@/services/addressApi";
import { MapPin, ChevronRight, Plus, Trash2, Edit2, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/common/EmptyState";
import { FormField } from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/SectionCard";

const MotionCard = motion.create(Card);
import { toast } from "sonner";
import Footer from "@/components/Footer";
import { WithTooltip } from "@/components/common/WithTooltip"

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
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

            <PageHeader
              className="mb-6 items-center"
              title="Address Book"
              actions={!showForm && (
                <Button
                  size="sm"
                  onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Address
                </Button>
              )}
            />

            {/* Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <SectionCard
                    title={editingId ? "Edit Address" : "New Address"}
                    actions={
                      <WithTooltip content="Close form"><Button variant="ghost" size="icon" aria-label="Close form" onClick={closeForm}>
                        <X className="h-4 w-4" />
                      </Button></WithTooltip>
                    }
                  >

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
                        <FormField key={f.name} label={f.label} htmlFor={`address-${f.name}`} className={(f as any).full ? "sm:col-span-2" : ""}>
                          <Input
                            id={`address-${f.name}`}
                            name={f.name}
                            value={(form as any)[f.name]}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            className="w-full"
                          />
                        </FormField>
                      ))}

                      <FormField label="Address Type" htmlFor="address-address_type">
                        <Select
                          name="address_type"
                          value={form.address_type}
                          onValueChange={(v) => setForm((f) => ({ ...f, address_type: v }))}
                        >
                          <SelectTrigger id="address-address_type" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="home">Home</SelectItem>
                            <SelectItem value="work">Work</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Checkbox
                        id="address-is_default"
                        checked={!!form.is_default}
                        onCheckedChange={(v) => setForm((f) => ({ ...f, is_default: v === true }))}
                      />
                      <Label htmlFor="address-is_default" className="text-muted-foreground">Set as default address</Label>
                    </div>

                    <div className="flex gap-3 mt-5">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving && <Spinner />}
                        {editingId ? "Update Address" : "Save Address"}
                      </Button>
                      <Button variant="outline" onClick={closeForm}>
                        Cancel
                      </Button>
                    </div>
                  </SectionCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Address Cards */}
            {isLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-40" />)}
              </div>
            ) : addresses.length === 0 ? (
              <EmptyState
                bordered
                className="py-16"
                icon={MapPin}
                title="No addresses saved yet"
                action={
                  <Button variant="link" onClick={() => setShowForm(true)}>
                    Add your first address
                  </Button>
                }
              />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <MotionCard key={addr.id} layout className="p-5 relative">
                    {addr.is_default && (
                      <Badge variant="secondary" className="absolute top-3 right-3">Default</Badge>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(addr)}
                      >
                        <Edit2 className="h-3 w-3" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(addr.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </Button>
                    </div>
                  </MotionCard>
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
