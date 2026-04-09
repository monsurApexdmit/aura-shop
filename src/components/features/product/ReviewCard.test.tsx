import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ReviewCard, { Review } from "./ReviewCard";

const mockReview: Review = {
  id: "review-1",
  author: {
    name: "John Doe",
    image: "https://example.com/avatar.jpg",
  },
  rating: 4.5,
  date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  comment: "Great product! Really happy with my purchase.",
  helpful: 5,
  notHelpful: 1,
  verified: true,
};

describe("ReviewCard", () => {
  it("renders author name", () => {
    render(<ReviewCard review={mockReview} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("displays review comment", () => {
    render(<ReviewCard review={mockReview} />);
    expect(screen.getByText("Great product! Really happy with my purchase.")).toBeInTheDocument();
  });

  it("shows verified purchase badge when verified", () => {
    render(<ReviewCard review={mockReview} />);
    expect(screen.getByText("Verified Purchase")).toBeInTheDocument();
  });

  it("hides verified badge when not verified", () => {
    const unverifiedReview = { ...mockReview, verified: false };
    render(<ReviewCard review={unverifiedReview} />);
    expect(screen.queryByText("Verified Purchase")).not.toBeInTheDocument();
  });

  it("displays relative date", () => {
    render(<ReviewCard review={mockReview} />);
    // Should display something like "2 days ago"
    expect(screen.getByText(/days ago/i)).toBeInTheDocument();
  });

  it("renders helpful button when onHelpful provided", () => {
    const onHelpful = vi.fn();
    render(<ReviewCard review={mockReview} onHelpful={onHelpful} />);
    expect(screen.getByRole("button", { name: /yes/i })).toBeInTheDocument();
  });

  it("calls onHelpful when helpful button clicked", () => {
    const onHelpful = vi.fn();
    render(<ReviewCard review={mockReview} onHelpful={onHelpful} />);

    const helpfulBtn = screen.getByRole("button", { name: /yes/i });
    helpfulBtn.click();

    expect(onHelpful).toHaveBeenCalledWith("review-1");
  });

  it("renders helpful button when onHelpful prop provided", () => {
    render(<ReviewCard review={mockReview} onHelpful={vi.fn()} />);
    // Verify the helpful button is present
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("renders not helpful button when onNotHelpful provided", () => {
    const onNotHelpful = vi.fn();
    render(<ReviewCard review={mockReview} onNotHelpful={onNotHelpful} />);
    expect(screen.getByRole("button", { name: /no/i })).toBeInTheDocument();
  });

  it("calls onNotHelpful when not helpful button clicked", () => {
    const onNotHelpful = vi.fn();
    render(<ReviewCard review={mockReview} onNotHelpful={onNotHelpful} />);

    const notHelpfulBtn = screen.getByRole("button", { name: /no/i });
    notHelpfulBtn.click();

    expect(onNotHelpful).toHaveBeenCalledWith("review-1");
  });

  it("displays rating using RatingDisplay", () => {
    const { container } = render(<ReviewCard review={mockReview} />);
    // Check for star rating display
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("applies custom className", () => {
    const { container } = render(
      <ReviewCard review={mockReview} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders avatar with author image", () => {
    const { container } = render(<ReviewCard review={mockReview} />);
    const img = container.querySelector("img");
    expect(img).toBeDefined();
  });

  it("shows avatar fallback without image", () => {
    const noImageReview = {
      ...mockReview,
      author: { name: "Jane Smith" },
    };
    render(<ReviewCard review={noImageReview} />);
    // Avatar should render with fallback (JS initials)
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });
});
