interface Breadcrumb {
  title: string
  disabled?: boolean
  to: string
}

export const getBreadcrumbsSchema = (breadcrumbs: Breadcrumb[]) => {
  return breadcrumbs.map((item) => {
    return {
      name: item.title,
      item: item.to,
    }
  })
}
