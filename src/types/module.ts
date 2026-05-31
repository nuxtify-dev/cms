import type { ModuleOptions as PagesModuleOptions } from '@nuxtify/pages'

export interface CmsModuleOptions {
  /**
   * Content options
   */
  content?: {
    articles?: {
      title?: string
      subtitle?: string
      description?: string
    }
    topics?: {
      title?: string
      subtitle?: string
      description?: string
    }
    contributors?: {
      title?: string
      subtitle?: string
      description?: string
    }
  }
}

export type ModuleOptions = Omit<PagesModuleOptions, keyof CmsModuleOptions> & CmsModuleOptions
