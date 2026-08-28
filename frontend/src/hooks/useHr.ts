"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as hrService from "../services/hr";

export function useHrJobs(status?: string) {
  return useQuery({
    queryKey: ["hr-jobs", status],
    queryFn: () => hrService.listMyJobs(status),
  });
}

export function useHrStats() {
  return useQuery({
    queryKey: ["hr-stats"],
    queryFn: hrService.getHrStats,
  });
}

export function useHrJob(id: number | undefined) {
  return useQuery({
    queryKey: ["hr-job", id],
    queryFn: () => hrService.getMyJob(id!),
    enabled: id != null,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hrService.createJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hr-jobs"] }),
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof hrService.updateJob>[1] }) =>
      hrService.updateJob(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hr-jobs"] }),
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hrService.deleteJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hr-jobs"] }),
  });
}

export function useSubmitJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hrService.submitJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hr-jobs"] }),
  });
}

export function useCloseJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hrService.closeJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hr-jobs"] }),
  });
}
