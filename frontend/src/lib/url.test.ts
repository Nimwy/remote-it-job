import { describe, expect, it } from "vitest";
import { jobUrl, parseJobId } from "./url";

describe("jobUrl", () => {
  it("builds a slug-based job URL", () => {
    expect(jobUrl("react-developer", 1)).toBe("/jobs/react-developer-1");
    expect(jobUrl("devops-engineer", 42)).toBe("/jobs/devops-engineer-42");
  });
});

describe("parseJobId", () => {
  it("extracts id from slug-id format", () => {
    expect(parseJobId("react-developer-1")).toBe(1);
    expect(parseJobId("fullstack-developer-123")).toBe(123);
  });

  it("falls back to numeric value", () => {
    expect(parseJobId("5")).toBe(5);
  });
});
