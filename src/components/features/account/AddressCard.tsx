import { ReactNode } from "react";
import { MapPin, Edit2, Trash2, CheckCircle2 } from "lucide-react";

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isDefault?: boolean;
}

interface AddressCardProps {
  /**
   * Address data
   */
  address: Address;

  /**
   * Whether this is the default/primary address
   */
  isDefault?: boolean;

  /**
   * Called when edit button is clicked
   */
  onEdit?: (addressId: string) => void;

  /**
   * Called when delete button is clicked
   */
  onDelete?: (addressId: string) => void;

  /**
   * Called when set as default button is clicked
   */
  onSetDefault?: (addressId: string) => void;

  /**
   * Custom actions to render
   */
  actions?: ReactNode;

  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * AddressCard Component
 *
 * Displays address information with edit/delete/set-default actions.
 * Used in AccountAddresses for managing saved addresses.
 *
 * @example
 * ```tsx
 * <AddressCard
 *   address={address}
 *   isDefault={defaultAddressId === address.id}
 *   onEdit={() => handleEdit(address.id)}
 *   onDelete={() => handleDelete(address.id)}
 *   onSetDefault={() => handleSetDefault(address.id)}
 * />
 * ```
 */
export default function AddressCard({
  address,
  isDefault = false,
  onEdit,
  onDelete,
  onSetDefault,
  actions,
  className = "",
}: AddressCardProps) {
  return (
    <div
      className={`bg-card border-2 rounded-lg p-4 sm:p-6 transition-all ${
        isDefault ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
      } ${className}`}
    >
      {/* Header with Default Badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <h3 className="font-semibold text-foreground text-sm">{address.fullName}</h3>
        </div>
        {isDefault && (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <CheckCircle2 className="h-3 w-3" />
            Default
          </span>
        )}
      </div>

      {/* Address Details */}
      <div className="space-y-2 mb-4 pb-4 border-b border-border/50 text-sm text-muted-foreground">
        <p>{address.address}</p>
        <p>
          {address.city}, {address.state} {address.zip}
        </p>
        <p>{address.phone}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {onEdit && (
          <button
            onClick={() => onEdit(address.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-sm font-medium text-foreground"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </button>
        )}

        {onSetDefault && !isDefault && (
          <button
            onClick={() => onSetDefault(address.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-sm font-medium text-foreground"
          >
            <CheckCircle2 className="h-4 w-4" />
            Set as Default
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this address?")) {
                onDelete(address.id);
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-destructive/30 hover:border-destructive hover:bg-destructive/5 transition-colors text-sm font-medium text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}

        {actions && <div className="ml-auto">{actions}</div>}
      </div>
    </div>
  );
}
