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
      enabled?: boolean
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
      enabled?: boolean
      routePrefix?: string
      title?: string
      subtitle?: string
      description?: string
    }
    topics?: {
      enabled?: boolean
      routePrefix?: string
      title?: string
      subtitle?: string
      description?: string
    }
    contributors?: {
      enabled?: boolean
      routePrefix?: string
      title?: string
      subtitle?: string
      description?: string
    }
    tags?: {
      enabled?: boolean
      prependIcon?: string
    }
  }
}

export type ModuleOptions = Omit<PagesModuleOptions, keyof CmsModuleOptions> & CmsModuleOptions
