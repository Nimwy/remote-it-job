import { api } from '../lib/api'
import type { AdminJob, AdminUser, Category, PaginatedResponse, Tag } from '../types'

export async function listAllJobs(params: {
  status?: string
  q?: string
  hr_id?: number
  category_id?: number
  page?: number
  page_size?: number
} = {}): Promise<PaginatedResponse<AdminJob>> {
  const res = await api.get('/admin/jobs', { params })
  return res.data
}

export async function listPendingJobs(): Promise<PaginatedResponse<AdminJob>> {
  const res = await api.get('/admin/jobs/pending')
  return res.data
}

export async function approveJob(id: number): Promise<AdminJob> {
  const res = await api.post(`/admin/jobs/${id}/approve`)
  return res.data
}

export async function rejectJob(id: number, reason: string): Promise<AdminJob> {
  const res = await api.post(`/admin/jobs/${id}/reject`, { reason })
  return res.data
}

export async function hideJob(id: number): Promise<AdminJob> {
  const res = await api.post(`/admin/jobs/${id}/hide`)
  return res.data
}

export async function unhideJob(id: number): Promise<AdminJob> {
  const res = await api.post(`/admin/jobs/${id}/unhide`)
  return res.data
}

export async function listHrs(params: {
  search?: string
  status?: string
  page?: number
  page_size?: number
} = {}): Promise<PaginatedResponse<AdminUser>> {
  const res = await api.get('/admin/users', { params })
  return res.data
}

export async function approveHr(id: number): Promise<AdminUser> {
  const res = await api.post(`/admin/users/${id}/approve`)
  return res.data
}

export async function blockHr(id: number): Promise<AdminUser> {
  const res = await api.post(`/admin/users/${id}/block`)
  return res.data
}

export async function unblockHr(id: number): Promise<AdminUser> {
  const res = await api.post(`/admin/users/${id}/unblock`)
  return res.data
}

export async function listAllCategories(): Promise<Category[]> {
  const res = await api.get('/admin/categories')
  return res.data
}

export async function createCategory(data: { name: string; slug?: string; sort_order?: number }): Promise<Category> {
  const res = await api.post('/admin/categories', data)
  return res.data
}

export async function updateCategory(
  id: number,
  data: { name?: string; slug?: string; sort_order?: number },
): Promise<Category> {
  const res = await api.patch(`/admin/categories/${id}`, data)
  return res.data
}

export async function deactivateCategory(id: number): Promise<Category> {
  const res = await api.post(`/admin/categories/${id}/deactivate`)
  return res.data
}

export async function listAllTags(): Promise<Tag[]> {
  const res = await api.get('/admin/tags')
  return res.data
}

export async function createTag(data: { name: string; slug?: string }): Promise<Tag> {
  const res = await api.post('/admin/tags', data)
  return res.data
}

export async function updateTag(id: number, data: { name?: string; slug?: string }): Promise<Tag> {
  const res = await api.patch(`/admin/tags/${id}`, data)
  return res.data
}

export async function deactivateTag(id: number): Promise<Tag> {
  const res = await api.post(`/admin/tags/${id}/deactivate`)
  return res.data
}
