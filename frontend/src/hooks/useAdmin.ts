import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as adminService from '../services/admin'

export function useAdminJobs(params: Parameters<typeof adminService.listAllJobs>[0] = {}) {
  return useQuery({
    queryKey: ['admin-jobs', params],
    queryFn: () => adminService.listAllJobs(params),
  })
}

export function useAdminPendingJobs() {
  return useQuery({
    queryKey: ['admin-jobs-pending'],
    queryFn: adminService.listPendingJobs,
  })
}

export function useAdminHrs(params: Parameters<typeof adminService.listHrs>[0] = {}) {
  return useQuery({
    queryKey: ['admin-hrs', params],
    queryFn: () => adminService.listHrs(params),
  })
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminService.listAllCategories,
  })
}

export function useAdminTags() {
  return useQuery({
    queryKey: ['admin-tags'],
    queryFn: adminService.listAllTags,
  })
}

export function useAdminJobAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      action,
      id,
      reason,
    }: {
      action: 'approve' | 'reject' | 'hide' | 'unhide'
      id: number
      reason?: string
    }) => {
      switch (action) {
        case 'approve':
          return adminService.approveJob(id)
        case 'reject':
          return adminService.rejectJob(id, reason ?? '')
        case 'hide':
          return adminService.hideJob(id)
        case 'unhide':
          return adminService.unhideJob(id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['admin-jobs-pending'] })
    },
  })
}

export function useAdminHrAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ action, id }: { action: 'approve' | 'block' | 'unblock'; id: number }) => {
      if (action === 'approve') return adminService.approveHr(id)
      if (action === 'block') return adminService.blockHr(id)
      return adminService.unblockHr(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hrs'] })
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminService.createCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
  })
}

export function useDeactivateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminService.deactivateCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminService.createTag,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tags'] }),
  })
}

export function useDeactivateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminService.deactivateTag,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tags'] }),
  })
}
