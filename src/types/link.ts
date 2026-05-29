import type { VBtn } from 'vuetify/components'

export interface PageLink {
  text?: string
  to?: string
  href?: string
  color?: string
  variant?: VBtn['$props']['variant']
  rounded?: VBtn['$props']['rounded']
  prependIcon?: string
  appendIcon?: string
  size?: VBtn['$props']['size']
  target?: '_blank' | '_self' | '_parent' | '_top'
  rel?: string
}

export interface BreadcrumbItem {
  title: string
  to: string
  disabled?: boolean
}
