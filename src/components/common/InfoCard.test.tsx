import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import InfoCard from "./InfoCard";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

describe("InfoCard", () => {
  it("renders title", () => {
    render(
      <InfoCard
        icon={Truck}
        title="Free Shipping"
        description="On orders over $50"
      />
    );
    expect(screen.getByText("Free Shipping")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(
      <InfoCard
        icon={Truck}
        title="Free Shipping"
        description="On orders over $50"
      />
    );
    expect(screen.getByText("On orders over $50")).toBeInTheDocument();
  });

  it("renders icon", () => {
    const { container } = render(
      <InfoCard
        icon={Truck}
        title="Shipping"
        description="Fast delivery"
      />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders badge when provided", () => {
    render(
      <InfoCard
        icon={Truck}
        title="Shipping"
        description="Fast"
        badge="Limited Time"
      />
    );
    expect(screen.getByText("Limited Time")).toBeInTheDocument();
  });

  it("does not render badge when not provided", () => {
    const { container } = render(
      <InfoCard
        icon={Truck}
        title="Shipping"
        description="Fast"
      />
    );
    const divs = container.querySelectorAll("div");
    const hasBadge = Array.from(divs).some(div =>
      div.className.includes("rounded-full") && div.textContent.includes("Limited")
    );
    expect(hasBadge).toBe(false);
  });

  it("applies badge variant class correctly", () => {
    const { container } = render(
      <InfoCard
        icon={Truck}
        title="Shipping"
        description="Fast"
        badge="Free"
        badgeVariant="accent"
      />
    );
    const badge = screen.getByText("Free");
    expect(badge).toHaveClass("bg-accent");
  });

  it("renders action when provided", () => {
    render(
      <InfoCard
        icon={Truck}
        title="Shipping"
        description="Fast"
        action={<Button>Learn More</Button>}
      />
    );
    expect(screen.getByRole("button", { name: /learn more/i })).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <InfoCard
        icon={Truck}
        title="Shipping"
        description="Fast"
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
