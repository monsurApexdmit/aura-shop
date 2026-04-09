import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RatingDisplay from "./RatingDisplay";

describe("RatingDisplay", () => {
  it("renders star rating", () => {
    const { container } = render(
      <RatingDisplay rating={4} reviewCount={100} />
    );
    const stars = container.querySelectorAll("svg");
    expect(stars.length).toBeGreaterThan(0);
  });

  it("displays rating value and review count", () => {
    render(<RatingDisplay rating={4.5} reviewCount={120} />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("(120)")).toBeInTheDocument();
  });

  it("renders percentage badge when provided", () => {
    render(<RatingDisplay rating={5} reviewCount={50} percentage={98} />);
    expect(screen.getByText("98%")).toBeInTheDocument();
  });

  it("hides count when showCount is false", () => {
    const { container } = render(
      <RatingDisplay rating={4} reviewCount={100} showCount={false} />
    );
    expect(screen.queryByText("(100)")).not.toBeInTheDocument();
    // Stars should still exist
    const stars = container.querySelectorAll("svg");
    expect(stars.length).toBeGreaterThan(0);
  });

  it("applies size variants correctly", () => {
    const { container: smContainer } = render(
      <RatingDisplay rating={4} reviewCount={10} size="sm" />
    );
    const { container: lgContainer } = render(
      <RatingDisplay rating={4} reviewCount={10} size="lg" />
    );

    const smText = smContainer.querySelector(".text-xs");
    const lgText = lgContainer.querySelector(".text-base");

    expect(smText).toBeInTheDocument();
    expect(lgText).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <RatingDisplay rating={4} reviewCount={10} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("rounds rating to one decimal place", () => {
    render(<RatingDisplay rating={4.567} reviewCount={100} />);
    expect(screen.getByText("4.6")).toBeInTheDocument();
  });
});
