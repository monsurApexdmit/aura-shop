import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import GridLayout from "./GridLayout";

describe("GridLayout", () => {
  it("renders children correctly", () => {
    const { container } = render(
      <GridLayout>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </GridLayout>
    );

    const children = container.querySelectorAll("div > div");
    expect(children.length).toBeGreaterThanOrEqual(3);
  });

  it("applies grid column classes", () => {
    const { container } = render(
      <GridLayout columns={4}>
        <div>Item</div>
      </GridLayout>
    );

    const grid = container.firstChild;
    expect(grid).toHaveClass("grid");
    expect(grid).toHaveClass("lg:grid-cols-4");
  });

  it("applies gap classes", () => {
    const { container } = render(
      <GridLayout gap="lg">
        <div>Item</div>
      </GridLayout>
    );

    const grid = container.firstChild;
    expect(grid).toHaveClass("gap-6");
  });

  it("applies responsive column classes", () => {
    const { container } = render(
      <GridLayout columns={4} mdColumns={2} smColumns={1}>
        <div>Item</div>
      </GridLayout>
    );

    const grid = container.firstChild;
    expect(grid).toHaveClass("grid-cols-1"); // sm
    expect(grid).toHaveClass("md:grid-cols-2"); // md
    expect(grid).toHaveClass("lg:grid-cols-4"); // lg
  });

  it("applies default responsive classes when mdColumns not provided", () => {
    const { container } = render(
      <GridLayout columns={4} smColumns={1}>
        <div>Item</div>
      </GridLayout>
    );

    const grid = container.firstChild;
    expect(grid).toHaveClass("grid-cols-1"); // sm
    expect(grid).toHaveClass("md:grid-cols-2"); // defaults to columns - 1
    expect(grid).toHaveClass("lg:grid-cols-4"); // lg
  });

  it("applies custom className", () => {
    const { container } = render(
      <GridLayout className="custom-class">
        <div>Item</div>
      </GridLayout>
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("supports all gap sizes", () => {
    const gaps = ["sm", "md", "lg", "xl"] as const;

    gaps.forEach((gap) => {
      const { container } = render(
        <GridLayout gap={gap}>
          <div>Item</div>
        </GridLayout>
      );

      const grid = container.firstChild;
      const expectedClass =
        gap === "sm"
          ? "gap-3"
          : gap === "md"
            ? "gap-4"
            : gap === "lg"
              ? "gap-6"
              : "gap-8";

      expect(grid).toHaveClass(expectedClass);
    });
  });

  it("supports all column counts", () => {
    const columns = [1, 2, 3, 4] as const;

    columns.forEach((col) => {
      const { container } = render(
        <GridLayout columns={col}>
          <div>Item</div>
        </GridLayout>
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass(`lg:grid-cols-${col}`);
    });
  });
});
