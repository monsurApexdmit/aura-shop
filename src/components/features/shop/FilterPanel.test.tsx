import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FilterPanel from "./FilterPanel";

vi.mock("@/hooks/useCategories", () => ({
  useCategories: () => ({ data: [] }),
}));

describe("FilterPanel", () => {
  const mockProps = {
    activeCatSlug: null,
    activeSubSlug: null,
    priceRange: [0, 1500] as [number, number],
    expandedCats: [],
    onSelectCategory: vi.fn(),
    onPriceChange: vi.fn(),
    onToggleCatExpand: vi.fn(),
  };

  beforeEach(() => {
    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  it("renders categories section", () => {
    render(<FilterPanel {...mockProps} />);
    expect(screen.getByText("Categories")).toBeInTheDocument();
  });

  it("renders All Products button", () => {
    render(<FilterPanel {...mockProps} />);
    expect(screen.getByText("All Products")).toBeInTheDocument();
  });

  it("renders price range section", () => {
    render(<FilterPanel {...mockProps} />);
    expect(screen.getByText("Price Range")).toBeInTheDocument();
  });

  it("renders popular tags section", () => {
    render(<FilterPanel {...mockProps} />);
    expect(screen.getByText("Popular Tags")).toBeInTheDocument();
  });

  it("renders all popular tags", () => {
    render(<FilterPanel {...mockProps} />);
    const tags = ["Hot Deal", "New", "Organic", "Best Seller", "Sale", "Trending", "Premium"];
    tags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it("calls onSelectCategory when All Products clicked", () => {
    const onSelectCategory = vi.fn();
    render(
      <FilterPanel {...mockProps} onSelectCategory={onSelectCategory} />
    );

    const allProductsBtn = screen.getByText("All Products");
    allProductsBtn.click();

    expect(onSelectCategory).toHaveBeenCalledWith(null, null);
  });

  it("applies active styling to All Products when no category selected", () => {
    render(
      <FilterPanel {...mockProps} activeCatSlug={null} />
    );
    const allProductsBtn = screen.getByText("All Products");
    expect(allProductsBtn).toHaveClass("bg-primary/10");
  });

  it("applies custom className", () => {
    const { container } = render(
      <FilterPanel {...mockProps} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
