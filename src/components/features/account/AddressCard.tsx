import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { MapPin, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    <Card className={cn("p-4 sm:p-6", isDefault && "border-primary bg-primary/5 ring-1 ring-primary", className)}>
      {/* Header with Default Badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <h3 className="font-semibold text-foreground text-sm">{address.fullName}</h3>
        </div>
        {isDefault && (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Default
          </Badge>
        )}
      </div>

      {/* Address Details */}
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>{address.address}</p>
        <p>
          {address.city}, {address.state} {address.zip}
        </p>
        <p>{address.phone}</p>
      </div>

      <Separator className="my-4" />

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {onEdit && (
          <Button
            variant="outline"
            onClick={() => onEdit(address.id)}
            className="gap-1.5"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
        )}

        {onSetDefault && !isDefault && (
          <Button
            variant="outline"
            onClick={() => onSetDefault(address.id)}
            className="gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            Set as Default
          </Button>
        )}

        {onDelete && (
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("Are you sure you want to delete this address?")) {
                onDelete(address.id);
              }
            }}
            className="gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}

        {actions && <div className="ml-auto">{actions}</div>}
      </div>
    </Card>
  );
}
