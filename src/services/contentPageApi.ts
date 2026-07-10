import { api } from '@/lib/api'

export type PageTemplate = 'about' | 'faq' | 'policy'

export interface PageHeroContent {
  kicker: string
  title: string
  description: string
}

export interface PageSeo {
  title?: string
  description?: string
}

export interface PageStatItem {
  label: string
  value: string
  icon: string
}

export interface PageValueItem {
  title: string
  description: string
  icon: string
}

export interface PageTeamItem {
  name: string
  role: string
  bio: string
}

export interface PageFaqItem {
  question: string
  answer: string
}

export interface PageFaqCategory {
  title: string
  items: PageFaqItem[]
}

export interface PageSection {
  title: string
  paragraphs: string[]
}

export interface AboutPageContent {
  template: 'about'
  hero: PageHeroContent
  valuesHeading: string
  teamHeading: string
  stats: PageStatItem[]
  values: PageValueItem[]
  team: PageTeamItem[]
  seo?: PageSeo
}

export interface FaqPageContent {
  template: 'faq'
  hero: PageHeroContent
  faqCategories: PageFaqCategory[]
  seo?: PageSeo
}

export interface PolicyPageContent {
  template: 'policy'
  hero: PageHeroContent
  sections: PageSection[]
  seo?: PageSeo
}

export type StorefrontPageContent = AboutPageContent | FaqPageContent | PolicyPageContent

export interface StorefrontContentPage {
  id: number
  title: string
  slug: string
  summary: string | null
  publishedAt: string | null
  updatedAt: string | null
  content: StorefrontPageContent
}

export const inferPageTemplate = (slug: string, content?: Partial<StorefrontPageContent> | null): PageTemplate => {
  if (content && typeof content === 'object' && 'template' in content && content.template) {
    return content.template as PageTemplate
  }

  if (slug === 'about') return 'about'
  if (slug === 'faq') return 'faq'
  return 'policy'
}

export const contentPageApi = {
  getBySlug: async (slug: string): Promise<StorefrontContentPage> => {
    const response = await api.get(`/pages/${slug}`)
    return response.data.data
  },
}

export default contentPageApi
