import type { ModuleOptions as PagesModuleOptions } from '@nuxtify/pages'
import type { ArticleSchemaType } from '../utils/contentSchemas'

export type { ArticleSchemaType }

export interface CmsModuleOptions {
  /**
   * Email options
   */
  email?: NonNullable<PagesModuleOptions['email']> & {
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
      schemaType?: ArticleSchemaType
      readTime?: {
        enabled?: boolean
        wordsPerMinute?: number
      }
      toc?: {
        enabled?: boolean
        title?: string
      }
    }
    notes?: {
      enabled?: boolean
      routePrefix?: string
      title?: string
      subtitle?: string
      description?: string
      schemaType?: ArticleSchemaType
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
      description?: string
    }
    docs?: {
      enabled?: boolean
      routePrefix?: string
      title?: string
      description?: string
      schemaType?: ArticleSchemaType
      toc?: {
        enabled?: boolean
        title?: string
      }
      prevNext?: {
        enabled?: boolean
      }
    }
  }
}

export type ModuleOptions = Omit<PagesModuleOptions, keyof CmsModuleOptions> & CmsModuleOptions
