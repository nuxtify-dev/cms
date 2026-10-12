import type { BreadcrumbItem } from '../../types/link'

export const getBreadcrumbsSchema = (breadcrumbs: BreadcrumbItem[]) => {
  return breadcrumbs.map((item) => {
    let url: string | undefined
    if (typeof item.to === 'string') {
      url = item.to
    }
    else if (item.to && typeof item.to === 'object' && 'path' in item.to && typeof item.to.path === 'string') {
      url = item.to.path
    }

    return {
      name: item.title,
      ...(url ? { item: url } : {}),
    }
  })
}
