import { apiFetch } from "../lib/api";
import type { Contact, HrJob, HrProfile, PaginatedResponse } from "../types";

export interface JobInput {
  title: string;
  category_id: number;
  job_type: string;
  location?: string | null;
  timezone?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string | null;
  description: string;
  requirements: string;
  expires_at?: string | null;
  tag_ids: number[];
}

export function getProfile(): Promise<HrProfile> {
  return apiFetch("/hr/profile");
}

export function updateProfile(data: {
  name?: string;
  company_name?: string;
  avatar?: string;
  contacts?: Contact[];
}): Promise<HrProfile> {
  return apiFetch("/hr/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function listMyJobs(
  status?: string,
  page = 1,
  page_size = 20,
): Promise<PaginatedResponse<HrJob>> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("page", String(page));
  params.set("page_size", String(page_size));
  return apiFetch(`/hr/jobs?${params.toString()}`);
}

export function createJob(data: JobInput): Promise<HrJob> {
  return apiFetch("/hr/jobs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMyJob(id: number): Promise<HrJob> {
  return apiFetch(`/hr/jobs/${id}`);
}

export function updateJob(id: number, data: Partial<JobInput>): Promise<HrJob> {
  return apiFetch(`/hr/jobs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteJob(id: number): Promise<void> {
  return apiFetch(`/hr/jobs/${id}`, { method: "DELETE" });
}

export function submitJob(id: number): Promise<HrJob> {
  return apiFetch(`/hr/jobs/${id}/submit`, { method: "POST" });
}

export function closeJob(id: number): Promise<HrJob> {
  return apiFetch(`/hr/jobs/${id}/close`, { method: "POST" });
}
