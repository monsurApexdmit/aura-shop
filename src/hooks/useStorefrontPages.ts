import { useQuery } from '@tanstack/react-query'
import contentPageApi from '@/services/contentPageApi'

export function useStorefrontPages() {
  return useQuery({
    queryKey: ['storefront-pages'],
    queryFn: contentPageApi.getAll,
    staleTime: 1000 * 60 * 5,
  })
}

// Slugs that already have a fixed route / link in the header or footer.
export const BUILT_IN_PAGE_SLUGS = ['about', 'faq', 'returns', 'shipping', 'privacy', 'contact']

export const pageHref = (slug: string) => `/pages/${slug}`
