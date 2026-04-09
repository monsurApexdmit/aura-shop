import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "./EmptyState";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

describe("EmptyState", () => {
  it("renders title", () => {
    render(
      <EmptyState
        icon={ShoppingCart}
        title="Your cart is empty"
        description="Add items to get started"
      />
    );
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(
      <EmptyState
        icon={ShoppingCart}
        title="Empty Cart"
        description="No items in your cart"
      />
    );
    expect(screen.getByText("No items in your cart")).toBeInTheDocument();
  });

  it("renders icon", () => {
    const { container } = render(
      <EmptyState
        icon={ShoppingCart}
        title="Empty"
        description="Nothing here"
      />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    render(
      <EmptyState
        icon={ShoppingCart}
        title="Empty Cart"
        description="Start shopping"
        action={<Button>Continue Shopping</Button>}
      />
    );
    expect(screen.getByRole("button", { name: /continue shopping/i })).toBeInTheDocument();
  });

  it("does not render action when not provided", () => {
    const { container } = render(
      <EmptyState
        icon={ShoppingCart}
        title="Empty"
        description="Nothing"
      />
    );
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(0);
  });

  it("applies custom className", () => {
    const { container } = render(
      <EmptyState
        icon={ShoppingCart}
        title="Empty"
        description="Nothing"
        className="custom-class"
      />
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });
});
