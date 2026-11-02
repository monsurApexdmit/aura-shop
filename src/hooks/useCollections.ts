import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { collectionApi, type CollectionSort } from '@/services/collectionApi'

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: collectionApi.getAll,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  })
}

const PER_PAGE = 24

// Collection + its products, a page at a time ("Load more" fetches the next page).
export function useCollection(slug: string | undefined, sort?: CollectionSort) {
  return useInfiniteQuery({
    queryKey: ['collection', slug, sort ?? 'default'],
    queryFn: ({ pageParam }) => collectionApi.getBySlug(slug!, { sort, page: pageParam, per_page: PER_PAGE }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { current_page, last_page } = last.products.meta
      return current_page < last_page ? current_page + 1 : undefined
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
    // An unknown slug is a 404; retrying it only delays the not-found page.
    retry: (count, err) => !(isAxiosError(err) && err.response?.status === 404) && count < 2,
  })
}
