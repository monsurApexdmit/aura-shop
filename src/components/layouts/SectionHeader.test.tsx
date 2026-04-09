import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SectionHeader from "./SectionHeader";

describe("SectionHeader", () => {
  it("renders title", () => {
    render(<SectionHeader title="Shop by Category" />);
    expect(screen.getByText("Shop by Category")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <SectionHeader
        title="Featured"
        description="Browse our best sellers"
      />
    );
    expect(screen.getByText("Browse our best sellers")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    const { container } = render(<SectionHeader title="Products" />);
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs.length).toBe(0);
  });

  it("applies left alignment by default", () => {
    const { container } = render(<SectionHeader title="Test" />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("text-left");
  });

  it("applies center alignment when specified", () => {
    const { container } = render(
      <SectionHeader title="Test" align="center" />
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("text-center");
  });

  it("applies right alignment when specified", () => {
    const { container } = render(
      <SectionHeader title="Test" align="right" />
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("text-right");
  });

  it("applies custom className", () => {
    const { container } = render(
      <SectionHeader title="Test" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
