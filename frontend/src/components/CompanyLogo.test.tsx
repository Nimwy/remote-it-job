// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CompanyLogo } from "./CompanyLogo";

describe("CompanyLogo", () => {
  it("renders the first letter of the company name (uppercased)", () => {
    render(<CompanyLogo name="remotive" />);
    expect(screen.getByText("R")).toBeInTheDocument();
  });

  it("falls back to '?' for empty names", () => {
    render(<CompanyLogo name="" />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("is deterministic and picks a palette color for a given name", () => {
    const { rerender, container } = render(<CompanyLogo name="Google" />);
    const first = container.querySelector("div")!.className;
    rerender(<CompanyLogo name="Google" />);
    expect(container.querySelector("div")!.className).toBe(first);
  });

  it("applies size classes for sm/md/lg", () => {
    const { rerender, container } = render(<CompanyLogo name="X" size="sm" />);
    expect(container.querySelector("div")!.className).toContain("h-10 w-10");
    rerender(<CompanyLogo name="X" size="lg" />);
    expect(container.querySelector("div")!.className).toContain("h-16 w-16");
  });
});
