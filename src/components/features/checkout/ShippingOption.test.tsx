import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ShippingOption, { ShippingOptionData } from "./ShippingOption";
import { Truck } from "lucide-react";

const mockOption: ShippingOptionData = {
  id: "standard",
  label: "Standard Shipping",
  price: 5.99,
  days: "5–7 Business Days",
  icon: Truck,
  description: "Reliable delivery at the best price",
};

describe("ShippingOption", () => {
  it("renders shipping option label", () => {
    render(
      <ShippingOption
        option={mockOption}
        selected={false}
        onChange={() => {}}
      />
    );
    expect(screen.getByText("Standard Shipping")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(
      <ShippingOption
        option={mockOption}
        selected={false}
        onChange={() => {}}
      />
    );
    expect(screen.getByText("Reliable delivery at the best price")).toBeInTheDocument();
  });

  it("displays price", () => {
    render(
      <ShippingOption
        option={mockOption}
        selected={false}
        onChange={() => {}}
      />
    );
    expect(screen.getByText("$5.99")).toBeInTheDocument();
  });

  it("displays delivery timeline", () => {
    render(
      <ShippingOption
        option={mockOption}
        selected={false}
        onChange={() => {}}
      />
    );
    expect(screen.getByText("5–7 Business Days")).toBeInTheDocument();
  });

  it("calls onChange when clicked", () => {
    const onChange = vi.fn();
    render(
      <ShippingOption
        option={mockOption}
        selected={false}
        onChange={onChange}
      />
    );

    const button = screen.getByRole("button");
    button.click();

    expect(onChange).toHaveBeenCalledWith("standard");
  });

  it("applies selected styling when selected", () => {
    const { container } = render(
      <ShippingOption
        option={mockOption}
        selected={true}
        onChange={() => {}}
      />
    );
    const button = container.querySelector("button");
    expect(button).toHaveClass("border-primary");
    expect(button).toHaveClass("bg-primary/5");
  });

  it("applies unselected styling when not selected", () => {
    const { container } = render(
      <ShippingOption
        option={mockOption}
        selected={false}
        onChange={() => {}}
      />
    );
    const button = container.querySelector("button");
    expect(button).toHaveClass("border-border");
  });

  it("applies custom className", () => {
    const { container } = render(
      <ShippingOption
        option={mockOption}
        selected={false}
        onChange={() => {}}
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders radio button indicator", () => {
    const { container } = render(
      <ShippingOption
        option={mockOption}
        selected={true}
        onChange={() => {}}
      />
    );
    // Check for the visual radio indicator
    const indicators = container.querySelectorAll(".rounded-full");
    expect(indicators.length).toBeGreaterThan(0);
  });
});
