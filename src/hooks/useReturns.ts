import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { returnApi, type CreateReturnPayload } from '@/services/returnApi'

export function useReturns(enabled = true) {
  return useQuery({
    queryKey: ['returns'],
    queryFn:  returnApi.getAll,
    enabled,
    staleTime: 1000 * 60 * 2,
  })
}

export function useReturn(id: number | null) {
  return useQuery({
    queryKey: ['return', id],
    queryFn:  () => returnApi.getById(id!),
    enabled:  !!id,
  })
}

export function useCreateReturn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateReturnPayload) => returnApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] })
    },
  })
}

export function useCancelReturn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => returnApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] })
    },
  })
}
