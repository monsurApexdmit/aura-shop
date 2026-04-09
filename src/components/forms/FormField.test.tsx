import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FormField from "./FormField";
import { Input } from "@/components/ui/input";

describe("FormField", () => {
  it("renders label text", () => {
    render(
      <FormField label="Email">
        <Input />
      </FormField>
    );
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("shows required asterisk when required prop is true", () => {
    render(
      <FormField label="Name" required>
        <Input />
      </FormField>
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("displays error message when provided", () => {
    render(
      <FormField label="Email" error="Email is required">
        <Input />
      </FormField>
    );
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("displays helper text when provided and no error", () => {
    render(
      <FormField label="Password" helperText="Must be at least 8 characters">
        <Input />
      </FormField>
    );
    expect(screen.getByText("Must be at least 8 characters")).toBeInTheDocument();
  });

  it("hides helper text when error is present", () => {
    render(
      <FormField
        label="Password"
        helperText="Must be at least 8 characters"
        error="Too short"
      >
        <Input />
      </FormField>
    );
    expect(screen.queryByText("Must be at least 8 characters")).not.toBeInTheDocument();
    expect(screen.getByText("Too short")).toBeInTheDocument();
  });

  it("renders children input element", () => {
    render(
      <FormField label="Email">
        <Input placeholder="Enter email" />
      </FormField>
    );
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <FormField label="Test" className="custom-class">
        <Input />
      </FormField>
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });
});
