import { apiFetch } from "../lib/api";
import { serverFetch } from "../lib/server";
import type {
  Category,
  JobDetail,
  JobListItem,
  PaginatedResponse,
  Tag,
} from "../types";

export interface JobFilters {
  q?: string;
  category?: string;
  tags?: string;
  job_type?: string;
  salary_min?: number;
  salary_max?: number;
  location?: string;
  timezone?: string;
  page?: number;
  page_size?: number;
  sort?: string;
}

export function listJobs(
  filters: JobFilters = {},
): Promise<PaginatedResponse<JobListItem>> {
  return apiFetch(
    `/jobs${buildQuery(filters)}`,
  );
}

export function getJob(id: number): Promise<JobDetail> {
  return apiFetch(`/jobs/${id}`);
}

export function listCategories(): Promise<Category[]> {
  return apiFetch("/categories");
}

export function listTags(): Promise<Tag[]> {
  return apiFetch("/tags");
}

// Server-side fetchers (SSR) — trả null khi lỗi để caller quyết định (notFound/error boundary)
export function serverListJobs(
  filters: JobFilters = {},
): Promise<PaginatedResponse<JobListItem> | null> {
  return serverFetch(`/jobs${buildQuery(filters)}`);
}

export function serverGetJob(id: number): Promise<JobDetail | null> {
  return serverFetch(`/jobs/${id}`);
}

export function serverListCategories(): Promise<Category[] | null> {
  return serverFetch("/categories");
}

export function serverListTags(): Promise<Tag[] | null> {
  return serverFetch("/tags");
}

function buildQuery(filters: JobFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
