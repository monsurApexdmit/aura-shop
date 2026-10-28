import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDepartments } from '@/hooks/useDepartments'
import { useCategories } from '@/hooks/useCategories'
import storefrontSettingsApi from '@/services/storefrontSettingsApi'

export function useHomepageSections() {
  return useQuery({
    queryKey: ['homepage-sections'],
    queryFn: storefrontSettingsApi.getHomepageSections,
    staleTime: 1000 * 60 * 10,
  })
}

// Shop links for the header nav and footer, matching the homepage aisle cards: the admin's cards when
// customised, else Women/Men/Kids categories, else the store's top-level categories, else Women/Men/Kids searches.
export function useShopNavLinks() {
  const { departments } = useDepartments()
  const { data: categories = [] } = useCategories()
  const { data } = useHomepageSections()
  const aisles = data?.aisles
  return useMemo(() => {
    if (aisles?.enabled && aisles.items.length > 0) return aisles.items.map((a) => ({ label: a.label, to: a.link }))
    const matched = departments.filter((d) => d.categoryId)
    if (matched.length > 0) return matched.map((d) => ({ label: d.label, to: d.href }))
    if (categories.length > 0) return categories.slice(0, 6).map((c) => ({ label: c.name, to: `/shop?cat=${c.slug}` }))
    return departments.map((d) => ({ label: d.label, to: d.href }))
  }, [aisles, departments, categories])
}
