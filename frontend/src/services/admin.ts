import { apiFetch } from "../lib/api";
import type { AdminJob, AdminUser, Category, PaginatedResponse, Tag } from "../types";

export function listAllJobs(params: {
  status?: string;
  q?: string;
  hr_id?: number;
  category_id?: number;
  page?: number;
  page_size?: number;
} = {}): Promise<PaginatedResponse<AdminJob>> {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  }
  return apiFetch(`/admin/jobs${qs.toString() ? `?${qs}` : ""}`);
}

export function listPendingJobs(): Promise<PaginatedResponse<AdminJob>> {
  return apiFetch("/admin/jobs/pending");
}

export function approveJob(id: number): Promise<AdminJob> {
  return apiFetch(`/admin/jobs/${id}/approve`, { method: "POST" });
}

export function rejectJob(id: number, reason: string): Promise<AdminJob> {
  return apiFetch(`/admin/jobs/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function hideJob(id: number): Promise<AdminJob> {
  return apiFetch(`/admin/jobs/${id}/hide`, { method: "POST" });
}

export function unhideJob(id: number): Promise<AdminJob> {
  return apiFetch(`/admin/jobs/${id}/unhide`, { method: "POST" });
}

export function deleteJob(id: number): Promise<void> {
  return apiFetch(`/admin/jobs/${id}`, { method: "DELETE" });
}

export function listHrs(params: {
  search?: string;
  status?: string;
  page?: number;
  page_size?: number;
} = {}): Promise<PaginatedResponse<AdminUser>> {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  }
  return apiFetch(`/admin/users${qs.toString() ? `?${qs}` : ""}`);
}

export function approveHr(id: number): Promise<AdminUser> {
  return apiFetch(`/admin/users/${id}/approve`, { method: "POST" });
}

export function blockHr(id: number): Promise<AdminUser> {
  return apiFetch(`/admin/users/${id}/block`, { method: "POST" });
}

export function unblockHr(id: number): Promise<AdminUser> {
  return apiFetch(`/admin/users/${id}/unblock`, { method: "POST" });
}

export function listAllCategories(): Promise<Category[]> {
  return apiFetch("/admin/categories");
}

export function createCategory(data: {
  name: string;
  slug?: string;
  sort_order?: number;
}): Promise<Category> {
  return apiFetch("/admin/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCategory(
  id: number,
  data: { name?: string; slug?: string; sort_order?: number },
): Promise<Category> {
  return apiFetch(`/admin/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deactivateCategory(id: number): Promise<Category> {
  return apiFetch(`/admin/categories/${id}/deactivate`, { method: "POST" });
}

export function listAllTags(): Promise<Tag[]> {
  return apiFetch("/admin/tags");
}

export function createTag(data: { name: string; slug?: string }): Promise<Tag> {
  return apiFetch("/admin/tags", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateTag(
  id: number,
  data: { name?: string; slug?: string },
): Promise<Tag> {
  return apiFetch(`/admin/tags/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deactivateTag(id: number): Promise<Tag> {
  return apiFetch(`/admin/tags/${id}/deactivate`, { method: "POST" });
}
