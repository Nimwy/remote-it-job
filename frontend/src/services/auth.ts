import { api } from '../lib/api'
import type { User } from '../types'

export async function register(data: {
  name: string
  email: string
  password: string
  company_name: string
}): Promise<User> {
  const res = await api.post('/auth/register', data)
  return res.data
}

export async function login(data: { email: string; password: string }): Promise<User> {
  const res = await api.post('/auth/login', data)
  return res.data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function me(): Promise<User> {
  const res = await api.get('/auth/me')
  return res.data
}

export async function changePassword(data: {
  current_password: string
  new_password: string
}): Promise<void> {
  await api.post('/auth/change-password', data)
}
