import * as React from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SectionCardProps extends Omit<React.ComponentProps<"div">, "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  /** Header-right slot (buttons, badges). */
  actions?: React.ReactNode
  footer?: React.ReactNode
  contentClassName?: string
}

/** Card with optional title/description/actions header and footer. Replaces `rounded-xl border bg-card p-5` panels. */
export function SectionCard({ title, description, actions, footer, className, contentClassName, children, ...props }: SectionCardProps) {
  const hasHeader = title || description || actions
  return (
    <Card className={className} {...props}>
      {hasHeader && (
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            {title && <CardTitle className="text-base">{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className={cn(!hasHeader && "pt-6", contentClassName)}>{children}</CardContent>
      {footer && <CardFooter className="gap-2">{footer}</CardFooter>}
    </Card>
  )
}
