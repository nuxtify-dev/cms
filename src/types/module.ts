import type { ModuleOptions as PagesModuleOptions } from '@nuxtify/pages'

export interface CmsModuleOptions {
  /**
   * Email options
   */
  email?: {
    reply?: string
  }

  /**
   * Content options
   */
  content?: {
    articles?: {
      routePrefix?: string
      title?: string
      subtitle?: string
      description?: string
      readTime?: {
        enabled?: boolean
        wordsPerMinute?: number
      }
    }
    notes?: {
      routePrefix?: string
      title?: string
      subtitle?: string
      description?: string
    }
    topics?: {
      routePrefix?: string
      title?: string
      subtitle?: string
      description?: string
    }
    contributors?: {
      routePrefix?: string
      title?: string
      subtitle?: string
      description?: string
    }
  }
}

export type ModuleOptions = Omit<PagesModuleOptions, keyof CmsModuleOptions> & CmsModuleOptions
