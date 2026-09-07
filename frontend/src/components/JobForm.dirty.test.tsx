// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

describe("JobForm tag dirty tracking (N-01)", () => {
  it("setValue without shouldDirty does NOT mark tag_ids dirty", () => {
    const { result } = renderHook(() => useForm<{ tag_ids: number[] }>({ defaultValues: { tag_ids: [] } }));
    act(() => result.current.setValue("tag_ids", [1]));
    expect(result.current.getFieldState("tag_ids").isDirty).toBe(false);
  });

  it("setValue with shouldDirty:true marks tag_ids dirty", () => {
    const { result } = renderHook(() => useForm<{ tag_ids: number[] }>({ defaultValues: { tag_ids: [] } }));
    act(() => result.current.setValue("tag_ids", [1], { shouldDirty: true }));
    expect(result.current.getFieldState("tag_ids").isDirty).toBe(true);
  });
});
