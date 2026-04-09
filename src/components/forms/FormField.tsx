import { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  /**
   * The label text displayed above the input
   */
  label: string;

  /**
   * Error message to display below the input
   */
  error?: string;

  /**
   * Whether the field is required (shows asterisk)
   */
  required?: boolean;

  /**
   * Helper text displayed below the label
   */
  helperText?: string;

  /**
   * The input element (usually Input, Textarea, etc.)
   */
  children: ReactNode;

  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * FormField Component
 *
 * Provides consistent form field styling and layout across the application.
 * Wraps an input element with label, error message, and helper text.
 *
 * @example
 * ```tsx
 * <FormField label="Email" error={errors.email} required>
 *   <Input
 *     name="email"
 *     value={form.email}
 *     onChange={handleChange}
 *     placeholder="Enter your email"
 *   />
 * </FormField>
 * ```
 */
export default function FormField({
  label,
  error,
  required = false,
  helperText,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>

      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      <div className="space-y-1">{children}</div>

      {error && (
        <p className="text-xs text-destructive font-medium animate-in fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
