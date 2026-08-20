import { useQuery } from '@tanstack/react-query'
import * as jobService from '../services/jobs'

export function useJobs(filters: jobService.JobFilters = {}) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobService.listJobs(filters),
  })
}

export function useJob(id: number | undefined) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJob(id!),
    enabled: id != null,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: jobService.listCategories,
  })
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: jobService.listTags,
  })
}
