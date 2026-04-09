import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AddressCard, { Address } from "./AddressCard";

const mockAddress: Address = {
  id: "addr-1",
  fullName: "John Doe",
  phone: "(555) 123-4567",
  address: "123 Main Street",
  city: "New York",
  state: "NY",
  zip: "10001",
};

describe("AddressCard", () => {
  it("renders address information", () => {
    render(<AddressCard address={mockAddress} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("123 Main Street")).toBeInTheDocument();
    expect(screen.getByText(/New York, NY 10001/)).toBeInTheDocument();
    expect(screen.getByText("(555) 123-4567")).toBeInTheDocument();
  });

  it("shows default badge when isDefault is true", () => {
    render(<AddressCard address={mockAddress} isDefault={true} />);
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("does not show default badge when isDefault is false", () => {
    render(<AddressCard address={mockAddress} isDefault={false} />);
    expect(screen.queryByText("Default")).not.toBeInTheDocument();
  });

  it("applies default styling when isDefault is true", () => {
    const { container } = render(
      <AddressCard address={mockAddress} isDefault={true} />
    );
    const card = container.firstChild;
    expect(card).toHaveClass("border-primary");
    expect(card).toHaveClass("bg-primary/5");
  });

  it("applies normal styling when isDefault is false", () => {
    const { container } = render(
      <AddressCard address={mockAddress} isDefault={false} />
    );
    const card = container.firstChild;
    expect(card).toHaveClass("border-border");
  });

  it("renders edit button when onEdit provided", () => {
    const onEdit = vi.fn();
    render(<AddressCard address={mockAddress} onEdit={onEdit} />);
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("calls onEdit with address id when edit clicked", () => {
    const onEdit = vi.fn();
    render(<AddressCard address={mockAddress} onEdit={onEdit} />);

    const button = screen.getByRole("button", { name: /edit/i });
    button.click();

    expect(onEdit).toHaveBeenCalledWith("addr-1");
  });

  it("renders set as default button when not default", () => {
    const onSetDefault = vi.fn();
    render(
      <AddressCard
        address={mockAddress}
        isDefault={false}
        onSetDefault={onSetDefault}
      />
    );
    expect(screen.getByRole("button", { name: /set as default/i })).toBeInTheDocument();
  });

  it("hides set as default button when already default", () => {
    const onSetDefault = vi.fn();
    render(
      <AddressCard
        address={mockAddress}
        isDefault={true}
        onSetDefault={onSetDefault}
      />
    );
    expect(screen.queryByRole("button", { name: /set as default/i })).not.toBeInTheDocument();
  });

  it("calls onSetDefault with address id", () => {
    const onSetDefault = vi.fn();
    render(
      <AddressCard
        address={mockAddress}
        isDefault={false}
        onSetDefault={onSetDefault}
      />
    );

    const button = screen.getByRole("button", { name: /set as default/i });
    button.click();

    expect(onSetDefault).toHaveBeenCalledWith("addr-1");
  });

  it("renders delete button when onDelete provided", () => {
    const onDelete = vi.fn();
    render(<AddressCard address={mockAddress} onDelete={onDelete} />);
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("shows confirmation dialog before deleting", () => {
    const onDelete = vi.fn();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<AddressCard address={mockAddress} onDelete={onDelete} />);

    const button = screen.getByRole("button", { name: /delete/i });
    button.click();

    expect(confirmSpy).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith("addr-1");

    confirmSpy.mockRestore();
  });

  it("does not delete if user cancels confirmation", () => {
    const onDelete = vi.fn();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<AddressCard address={mockAddress} onDelete={onDelete} />);

    const button = screen.getByRole("button", { name: /delete/i });
    button.click();

    expect(confirmSpy).toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it("applies custom className", () => {
    const { container } = render(
      <AddressCard address={mockAddress} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
