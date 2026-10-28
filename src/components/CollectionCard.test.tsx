import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CollectionCard, { productCountLabel } from "./CollectionCard";

class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver ??= IO;

const base = { name: "Premium Tech", slug: "premium-tech", imageUrl: null, productCount: 12, description: null };

const renderCard = (overrides: Partial<typeof base> = {}) =>
  render(
    <MemoryRouter>
      <CollectionCard collection={{ ...base, ...overrides }} />
    </MemoryRouter>
  );

describe("CollectionCard", () => {
  it("links to the collection page and shows name and count", () => {
    renderCard();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/collections/premium-tech");
    expect(screen.getByText("Premium Tech")).toBeInTheDocument();
    expect(screen.getByText("12 products")).toBeInTheDocument();
  });

  it("shows the banner image when there is one", () => {
    const { container } = renderCard({ imageUrl: "https://cdn.example.com/banner.jpg" });
    expect(container.querySelector("img")).toHaveAttribute("src", "https://cdn.example.com/banner.jpg");
  });

  it("falls back to the initial without an image", () => {
    const { container } = renderCard();
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("P")).toBeInTheDocument();
  });

  it("pluralises the product count", () => {
    expect(productCountLabel(1)).toBe("1 product");
    expect(productCountLabel(0)).toBe("0 products");
  });
});
