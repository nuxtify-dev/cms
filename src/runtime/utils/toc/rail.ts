export interface PageTocLink {
  id: string
  depth?: number
  text: string
  children?: PageTocLink[]
}

export interface FlattenedTocItem {
  id: string
  nested: boolean
}

export interface MeasuredTocItem extends FlattenedTocItem {
  top: number
  bottom: number
  x: number
}

export interface PolylinePoint {
  x: number
  y: number
  s: number
}

export interface TocRailState {
  pathD: string
  width: number
  height: number
  totalLength: number
  dashLength: number
  dashOffset: number
  fadeOffset: string
  visible: boolean
  animate: boolean
  direction: 'up' | 'down' | 'none'
}

export const OUTER_RAIL_X = 1
export const INNER_RAIL_X = 11
export const SVG_RAIL_WIDTH = 14
export const RAIL_TAIL_HEIGHT = 0
export const ACTIVE_EXTEND_TOP = 4
export const ACTIVE_EXTEND_BOTTOM = 8

export function createEmptyTocRailState(): TocRailState {
  return {
    pathD: '',
    width: SVG_RAIL_WIDTH,
    height: 0,
    totalLength: 0,
    dashLength: 0,
    dashOffset: 0,
    fadeOffset: '70%',
    visible: false,
    animate: false,
    direction: 'none',
  }
}

export function flattenTocItems(links: PageTocLink[]): FlattenedTocItem[] {
  const items: FlattenedTocItem[] = []
  for (const link of links) {
    if (link.id) {
      items.push({ id: link.id, nested: (link.depth ?? 2) > 2 })
    }
    if (Array.isArray(link.children)) {
      for (const child of link.children) {
        if (child.id) {
          items.push({ id: child.id, nested: true })
        }
      }
    }
  }
  return items
}

export function buildRailPolyline(items: MeasuredTocItem[], railBottom: number): PolylinePoint[] {
  const first = items[0]
  if (!first) return []

  const rawPoints: Array<{ x: number, y: number }> = [{ x: first.x, y: first.top }]
  let lastY = first.top

  for (let i = 1; i < items.length; i++) {
    const prev = items[i - 1]!
    const curr = items[i]!
    if (curr.x === prev.x) continue

    const dx = Math.abs(curr.x - prev.x)
    const prevHeight = Math.max(0, prev.bottom - prev.top)
    const currHeight = Math.max(0, curr.bottom - curr.top)
    const bendHalf = Math.min(dx / 2, prevHeight * 0.4, currHeight * 0.4)
    const yMid = (prev.bottom + curr.top) / 2
    const bendStart = Math.max(lastY, Math.min(yMid - bendHalf, prev.bottom))
    const bendEnd = Math.max(bendStart, Math.min(yMid + bendHalf, curr.bottom))

    rawPoints.push({ x: prev.x, y: bendStart })
    rawPoints.push({ x: curr.x, y: bendEnd })
    lastY = bendEnd
  }

  const last = items[items.length - 1]!
  rawPoints.push({ x: last.x, y: Math.max(lastY, railBottom) })

  const points: PolylinePoint[] = []
  let cumulativeS = 0
  for (let i = 0; i < rawPoints.length; i++) {
    const pt = rawPoints[i]!
    if (i > 0) {
      const prevPt = rawPoints[i - 1]!
      cumulativeS += Math.hypot(pt.x - prevPt.x, pt.y - prevPt.y)
    }
    points.push({ x: pt.x, y: pt.y, s: cumulativeS })
  }
  return points
}

export function arcLengthAtY(points: PolylinePoint[], targetY: number): number {
  const first = points[0]
  const last = points[points.length - 1]
  if (!first || !last) return 0
  if (targetY <= first.y) return first.s
  if (targetY >= last.y) return last.s

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]!
    const b = points[i + 1]!
    if (targetY <= b.y) {
      const dy = b.y - a.y
      const t = dy > 0 ? (targetY - a.y) / dy : 0
      return a.s + t * (b.s - a.s)
    }
  }
  return last.s
}

export function computeTocRail(
  listEl: HTMLElement | null,
  linkEls: ReadonlyMap<string, HTMLElement>,
  items: FlattenedTocItem[],
  activeId: string,
  prevActiveTop: number | null,
  animate: boolean,
): { state: TocRailState, activeTop: number | null } {
  if (!listEl || items.length === 0) {
    return { state: createEmptyTocRailState(), activeTop: null }
  }

  const listRect = listEl.getBoundingClientRect()
  if (listRect.height <= 0) {
    return { state: createEmptyTocRailState(), activeTop: null }
  }

  const measured: MeasuredTocItem[] = []
  for (const item of items) {
    const el = linkEls.get(item.id)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    if (rect.height <= 0) continue
    measured.push({
      ...item,
      top: Math.max(0, rect.top - listRect.top),
      bottom: Math.max(0, rect.bottom - listRect.top),
      x: item.nested ? INNER_RAIL_X : OUTER_RAIL_X,
    })
  }

  const activeItem = measured.find(item => item.id === activeId)
  if (measured.length === 0 || !activeItem) {
    return { state: createEmptyTocRailState(), activeTop: null }
  }

  const lastMeasured = measured[measured.length - 1]!
  const railBottom = lastMeasured.bottom + RAIL_TAIL_HEIGHT
  const points = buildRailPolyline(measured, railBottom)
  const totalLength = points[points.length - 1]?.s ?? 0
  if (points.length < 2 || totalLength <= 0) {
    return { state: createEmptyTocRailState(), activeTop: null }
  }

  const pathD = points
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
    .join(' ')

  const activeTop = Math.max(points[0]!.y, activeItem.top - ACTIVE_EXTEND_TOP)
  const activeBottom = Math.min(railBottom, activeItem.bottom + ACTIVE_EXTEND_BOTTOM)
  const sStart = arcLengthAtY(points, activeTop)
  const sEnd = arcLengthAtY(points, activeBottom)
  const dashLength = Math.max(1, sEnd - sStart)

  let direction: 'up' | 'down' | 'none' = 'none'
  if (animate && prevActiveTop !== null) {
    if (activeItem.top > prevActiveTop + 0.5) {
      direction = 'down'
    }
    else if (activeItem.top < prevActiveTop - 0.5) {
      direction = 'up'
    }
  }

  const fadeStartY = measured.length > 1 ? Math.max(0, lastMeasured.top - 2) : railBottom
  const fadeStop = railBottom > 0
    ? `${Math.min(100, Math.round((fadeStartY / railBottom) * 100))}%`
    : '100%'

  return {
    activeTop: activeItem.top,
    state: {
      pathD,
      width: SVG_RAIL_WIDTH,
      height: railBottom,
      totalLength,
      dashLength,
      dashOffset: -sStart,
      fadeOffset: fadeStop,
      visible: true,
      animate: animate && direction !== 'none',
      direction,
    },
  }
}
