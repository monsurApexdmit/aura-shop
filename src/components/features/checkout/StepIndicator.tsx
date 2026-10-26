import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { WithTooltip } from "@/components/common/WithTooltip"

export interface Step {
  id: number;
  label: string;
  icon: LucideIcon;
}

interface StepIndicatorProps {
  /**
   * Array of steps to display
   */
  steps: Step[];

  /**
   * Current active step (1-indexed)
   */
  currentStep: number;

  /**
   * Called when step is clicked (optional, for allowing step navigation)
   */
  onStepClick?: (stepId: number) => void;

  /**
   * Whether previous steps are clickable
   */
  allowNavigation?: boolean;

  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * StepIndicator Component
 *
 * Displays a visual progress indicator for multi-step processes.
 * Used in Checkout for showing shipping → payment → review → complete steps.
 *
 * @example
 * ```tsx
 * <StepIndicator
 *   steps={steps}
 *   currentStep={2}
 *   onStepClick={(stepId) => setStep(stepId)}
 *   allowNavigation={true}
 * />
 * ```
 */
export default function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  allowNavigation = false,
  className = "",
}: StepIndicatorProps) {
  return (
    <div className={cn("w-full overflow-x-auto pb-2", className)}>
      <div className="flex min-w-max items-center justify-start gap-0 px-1 sm:justify-center">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isClickable = allowNavigation && currentStep > step.id;
        const StepIcon = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <WithTooltip content={step.label}><Button
              type="button"
              variant={isCurrent || isCompleted ? "default" : "secondary"}
              size="icon"
              aria-label={step.label}
              onClick={() => {
                if (isClickable && onStepClick) {
                  onStepClick(step.id);
                }
              }}
              disabled={!isClickable}
              className="disabled:opacity-100"
            >
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button></WithTooltip>

            {/* Step Label */}
            <div className="flex flex-col items-center gap-1.5 ml-1.5 mr-1.5 sm:ml-2 sm:mr-2">
              <span
                className={cn("whitespace-nowrap text-[10px] sm:text-xs font-semibold", isCurrent || isCompleted
                    ? "text-primary"
                    : "text-muted-foreground")}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn("w-8 sm:w-16 md:w-24 h-0.5 mx-1 sm:mx-2 mb-5 rounded-full transition-colors duration-300", currentStep > step.id ? "bg-primary" : "bg-border")}
              />
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
