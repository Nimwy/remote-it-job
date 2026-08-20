import { api } from '../lib/api'
import type { Contact, HrJob, HrProfile, PaginatedResponse } from '../types'

export interface JobInput {
  title: string
  category_id: number
  job_type: string
  location?: string | null
  timezone?: string | null
  salary_min?: number | null
  salary_max?: number | null
  currency?: string | null
  description: string
  requirements: string
  expires_at?: string | null
  tag_ids: number[]
}

export async function getProfile(): Promise<HrProfile> {
  const res = await api.get('/hr/profile')
  return res.data
}

export async function updateProfile(data: {
  name?: string
  company_name?: string
  avatar?: string
  contacts?: Contact[]
}): Promise<HrProfile> {
  const res = await api.patch('/hr/profile', data)
  return res.data
}

export async function listMyJobs(
  status?: string,
  page = 1,
  page_size = 20,
): Promise<PaginatedResponse<HrJob>> {
  const res = await api.get('/hr/jobs', { params: { status, page, page_size } })
  return res.data
}

export async function createJob(data: JobInput): Promise<HrJob> {
  const res = await api.post('/hr/jobs', data)
  return res.data
}

export async function getMyJob(id: number): Promise<HrJob> {
  const res = await api.get(`/hr/jobs/${id}`)
  return res.data
}

export async function updateJob(id: number, data: Partial<JobInput>): Promise<HrJob> {
  const res = await api.patch(`/hr/jobs/${id}`, data)
  return res.data
}

export async function deleteJob(id: number): Promise<void> {
  await api.delete(`/hr/jobs/${id}`)
}

export async function submitJob(id: number): Promise<HrJob> {
  const res = await api.post(`/hr/jobs/${id}/submit`)
  return res.data
}

export async function closeJob(id: number): Promise<HrJob> {
  const res = await api.post(`/hr/jobs/${id}/close`)
  return res.data
}
