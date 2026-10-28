import { useMemo } from 'react'
import { useCategories } from '@/hooks/useCategories'
import type { ApiCategory } from '@/services/categoryApi'

export interface Department {
  key: 'women' | 'men' | 'kids'
  label: string
  pattern: RegExp
}

export interface ResolvedDepartment extends Department {
  href: string
  /** Set when a matching category/subcategory exists; used to filter product lists. */
  categoryId?: number
}

export const DEPARTMENTS: Department[] = [
  { key: 'women', label: 'Women', pattern: /\b(women|womens|woman|ladies|female)\b/i },
  { key: 'men',   label: 'Men',   pattern: /\b(men|mens|man|gents|male)\b/i },
  { key: 'kids',  label: 'Kids',  pattern: /\b(kids?|child|children|baby|babies|boys?|girls?)\b/i },
]

// Departments are matched against the store's own categories (top level first,
// then subcategories). With no match the link falls back to a product search.
export function resolveDepartments(categories: ApiCategory[]): ResolvedDepartment[] {
  return DEPARTMENTS.map((d) => {
    const matches = (c: { name: string; slug: string }) =>
      d.pattern.test(c.name) || d.pattern.test(c.slug.replace(/-/g, ' '))

    const cat = categories.find(matches)
    if (cat) return { ...d, href: `/shop?cat=${cat.slug}`, categoryId: cat.id }

    for (const parent of categories) {
      const sub = parent.children.find(matches)
      if (sub) return { ...d, href: `/shop?cat=${parent.slug}&sub=${sub.slug}`, categoryId: sub.id }
    }

    return { ...d, href: `/shop?search=${encodeURIComponent(d.label)}` }
  })
}

export function useDepartments() {
  const { data: categories = [], isLoading } = useCategories()
  const departments = useMemo(() => resolveDepartments(categories), [categories])
  return { departments, isLoading }
}
