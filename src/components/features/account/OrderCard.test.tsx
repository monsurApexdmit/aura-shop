import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import OrderCard, { Order } from "./OrderCard";

const mockOrder: Order = {
  id: "ORD-123456",
  date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  status: "processing",
  items: [
    {
      id: "prod-1",
      name: "Test Product",
      price: 99.99,
      quantity: 1,
      image: "test.jpg",
    },
    {
      id: "prod-2",
      name: "Another Product",
      price: 49.99,
      quantity: 2,
      image: "test2.jpg",
    },
  ],
  subtotal: 199.97,
  shipping: 9.99,
  tax: 16.00,
  total: 225.96,
  shippingAddress: {
    fullName: "John Doe",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zip: "10001",
  },
};

describe("OrderCard", () => {
  it("renders order ID", () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByText("ORD-123456")).toBeInTheDocument();
  });

  it("displays order status", () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByText("Processing")).toBeInTheDocument();
  });

  it("shows item count", () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByText(/3 items/)).toBeInTheDocument();
  });

  it("displays order total", () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByText("$225.96")).toBeInTheDocument();
  });

  it("renders view details button when onView provided", () => {
    const onView = vi.fn();
    render(<OrderCard order={mockOrder} onView={onView} />);
    const button = screen.getByRole("button", { name: /view details/i });
    expect(button).toBeInTheDocument();
  });

  it("calls onView when view button clicked", () => {
    const onView = vi.fn();
    render(<OrderCard order={mockOrder} onView={onView} />);

    const button = screen.getByRole("button", { name: /view details/i });
    button.click();

    expect(onView).toHaveBeenCalledWith("ORD-123456");
  });

  it("renders track button for non-cancelled orders", () => {
    const onTrack = vi.fn();
    render(
      <OrderCard order={mockOrder} onTrack={onTrack} />
    );
    expect(screen.getByRole("button", { name: /track order/i })).toBeInTheDocument();
  });

  it("hides track button for cancelled orders", () => {
    const cancelledOrder = { ...mockOrder, status: "cancelled" as const };
    const onTrack = vi.fn();
    render(
      <OrderCard order={cancelledOrder} onTrack={onTrack} />
    );
    expect(screen.queryByRole("button", { name: /track order/i })).not.toBeInTheDocument();
  });

  it("renders reorder button for delivered orders", () => {
    const deliveredOrder = { ...mockOrder, status: "delivered" as const };
    const onReorder = vi.fn();
    render(
      <OrderCard order={deliveredOrder} onReorder={onReorder} />
    );
    expect(screen.getByRole("button", { name: /reorder/i })).toBeInTheDocument();
  });

  it("hides reorder button for non-delivered orders", () => {
    const onReorder = vi.fn();
    render(
      <OrderCard order={mockOrder} onReorder={onReorder} />
    );
    expect(screen.queryByRole("button", { name: /reorder/i })).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <OrderCard order={mockOrder} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("displays all items when less than 4", () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByText(/Test Product/)).toBeInTheDocument();
    expect(screen.getByText(/Another Product/)).toBeInTheDocument();
  });

  it("shows item count correctly for many items", () => {
    const manyItemsOrder: Order = {
      ...mockOrder,
      items: [
        ...mockOrder.items,
        {
          id: "prod-3",
          name: "Third Product",
          price: 29.99,
          quantity: 1,
        },
        {
          id: "prod-4",
          name: "Fourth Product",
          price: 19.99,
          quantity: 1,
        },
      ],
    };
    render(<OrderCard order={manyItemsOrder} />);
    expect(screen.getByText(/5 items/)).toBeInTheDocument();
  });

  it("displays different status labels", () => {
    const statuses = ["processing", "shipped", "delivered", "cancelled"] as const;

    statuses.forEach((status) => {
      const order = { ...mockOrder, status };
      const { unmount } = render(<OrderCard order={order} />);

      const labelMap = {
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled",
      };

      expect(screen.getByText(labelMap[status])).toBeInTheDocument();
      unmount();
    });
  });
});
