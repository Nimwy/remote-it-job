import { api } from '../lib/api'
import type { Category, JobDetail, JobListItem, PaginatedResponse, Tag } from '../types'

export interface JobFilters {
  q?: string
  category?: string
  tags?: string
  job_type?: string
  salary_min?: number
  salary_max?: number
  location?: string
  timezone?: string
  page?: number
  page_size?: number
  sort?: string
}

export async function listJobs(filters: JobFilters = {}): Promise<PaginatedResponse<JobListItem>> {
  const res = await api.get('/jobs', { params: filters })
  return res.data
}

export async function getJob(id: number): Promise<JobDetail> {
  const res = await api.get(`/jobs/${id}`)
  return res.data
}

export async function listCategories(): Promise<Category[]> {
  const res = await api.get('/categories')
  return res.data
}

export async function listTags(): Promise<Tag[]> {
  const res = await api.get('/tags')
  return res.data
}
