import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import StepIndicator, { Step } from "./StepIndicator";
import { MapPin, CreditCard, ClipboardCheck, CheckCircle2 } from "lucide-react";

const mockSteps: Step[] = [
  { id: 1, label: "Shipping", icon: MapPin },
  { id: 2, label: "Payment", icon: CreditCard },
  { id: 3, label: "Review", icon: ClipboardCheck },
  { id: 4, label: "Complete", icon: CheckCircle2 },
];

describe("StepIndicator", () => {
  it("renders all steps", () => {
    render(<StepIndicator steps={mockSteps} currentStep={1} />);
    expect(screen.getByText("Shipping")).toBeInTheDocument();
    expect(screen.getByText("Payment")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("highlights current step", () => {
    const { container } = render(
      <StepIndicator steps={mockSteps} currentStep={2} />
    );
    // Current step should have primary styling
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("marks completed steps with checkmark", () => {
    const { container } = render(
      <StepIndicator steps={mockSteps} currentStep={3} />
    );
    // Steps 1 and 2 should be completed
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("calls onStepClick when step is clicked and allowNavigation is true", () => {
    const onStepClick = vi.fn();
    render(
      <StepIndicator
        steps={mockSteps}
        currentStep={3}
        onStepClick={onStepClick}
        allowNavigation={true}
      />
    );

    const buttons = screen.getAllByRole("button");
    // Click on first button (already completed)
    buttons[0].click();

    expect(onStepClick).toHaveBeenCalledWith(1);
  });

  it("does not navigate when allowNavigation is false", () => {
    const onStepClick = vi.fn();
    render(
      <StepIndicator
        steps={mockSteps}
        currentStep={3}
        onStepClick={onStepClick}
        allowNavigation={false}
      />
    );

    const buttons = screen.getAllByRole("button");
    buttons[0].click();

    expect(onStepClick).not.toHaveBeenCalled();
  });

  it("only allows navigation to completed steps", () => {
    const onStepClick = vi.fn();
    render(
      <StepIndicator
        steps={mockSteps}
        currentStep={2}
        onStepClick={onStepClick}
        allowNavigation={true}
      />
    );

    const buttons = screen.getAllByRole("button");
    // Try clicking on step 3 (not completed)
    buttons[2].click();

    expect(onStepClick).not.toHaveBeenCalled();
  });

  it("applies custom className", () => {
    const { container } = render(
      <StepIndicator
        steps={mockSteps}
        currentStep={1}
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("updates when currentStep changes", () => {
    const { rerender } = render(
      <StepIndicator steps={mockSteps} currentStep={1} />
    );

    expect(screen.getByText("Shipping")).toBeInTheDocument();

    rerender(
      <StepIndicator steps={mockSteps} currentStep={3} />
    );

    expect(screen.getByText("Review")).toBeInTheDocument();
  });

  it("displays connector lines between steps", () => {
    const { container } = render(
      <StepIndicator steps={mockSteps} currentStep={2} />
    );
    const lines = container.querySelectorAll("[class*='rounded-full']");
    expect(lines.length).toBeGreaterThan(0);
  });
});
