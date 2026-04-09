import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import QuickActionButtons from "./QuickActionButtons";

describe("QuickActionButtons", () => {
  const mockProps = {
    liked: false,
    onWishlist: vi.fn(),
    onView: vi.fn(),
    onAddCart: vi.fn(),
  };

  it("renders three buttons when not hideAddCart", () => {
    const { container } = render(<QuickActionButtons {...mockProps} />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(3);
  });

  it("renders two buttons when hideAddCart is true", () => {
    const { container } = render(
      <QuickActionButtons {...mockProps} hideAddCart={true} />
    );
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(2);
  });

  it("calls onWishlist when wishlist button clicked", () => {
    const onWishlist = vi.fn();
    render(<QuickActionButtons {...mockProps} onWishlist={onWishlist} />);

    const buttons = screen.getAllByRole("button");
    buttons[0].click();

    expect(onWishlist).toHaveBeenCalled();
  });

  it("calls onView when view button clicked", () => {
    const onView = vi.fn();
    render(<QuickActionButtons {...mockProps} onView={onView} />);

    const buttons = screen.getAllByRole("button");
    buttons[1].click();

    expect(onView).toHaveBeenCalled();
  });

  it("calls onAddCart when add to cart button clicked", () => {
    const onAddCart = vi.fn();
    render(<QuickActionButtons {...mockProps} onAddCart={onAddCart} />);

    const buttons = screen.getAllByRole("button");
    buttons[2].click();

    expect(onAddCart).toHaveBeenCalled();
  });

  it("shows filled heart when liked is true", () => {
    const { container } = render(
      <QuickActionButtons {...mockProps} liked={true} />
    );
    const wishlistBtn = container.querySelector("button");
    expect(wishlistBtn).toHaveClass("bg-accent");
  });

  it("shows unfilled heart when liked is false", () => {
    const { container } = render(
      <QuickActionButtons {...mockProps} liked={false} />
    );
    const wishlistBtn = container.querySelector("button");
    expect(wishlistBtn).toHaveClass("bg-card/80");
  });

  it("applies custom className", () => {
    const { container } = render(
      <QuickActionButtons {...mockProps} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("prevents default event propagation", () => {
    const onWishlist = vi.fn();
    render(<QuickActionButtons {...mockProps} onWishlist={onWishlist} />);

    const event = new MouseEvent("click", { bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    const button = screen.getAllByRole("button")[0];
    button.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("has proper titles for accessibility", () => {
    render(<QuickActionButtons {...mockProps} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveAttribute("title");
    expect(buttons[1]).toHaveAttribute("title");
    expect(buttons[2]).toHaveAttribute("title");
  });

  it("updates styling when liked prop changes", () => {
    const { container, rerender } = render(
      <QuickActionButtons {...mockProps} liked={false} />
    );

    let wishlistBtn = container.querySelector("button");
    expect(wishlistBtn).toHaveClass("bg-card/80");

    rerender(
      <QuickActionButtons {...mockProps} liked={true} />
    );

    wishlistBtn = container.querySelector("button");
    expect(wishlistBtn).toHaveClass("bg-accent");
  });
});
