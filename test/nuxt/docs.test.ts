import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import type { ContentNavigationItem } from '@nuxt/content'
import { defineComponent, h, nextTick, type Component } from 'vue'
import PageToc from '../../src/runtime/components/page/PageToc.vue'
import DocsTabs from '../../src/runtime/components/docs/DocsTabs.vue'
import DocsSidebar from '../../src/runtime/components/docs/DocsSidebar.vue'
import DocsTitle from '../../src/runtime/components/docs/DocsTitle.vue'
import DocsPrevNext from '../../src/runtime/components/docs/DocsPrevNext.vue'
import DocsMobileBar from '../../src/runtime/components/docs/DocsMobileBar.vue'
import {
  buildDocsBreadcrumbs,
  findFirstDocLeaf,
  resolveDocNavNode,
  rewriteDocsSurroundings,
  splitDocsNavigation,
  toDocsContentPath,
  toDocsPublicPath,
  unwrapDocsNavigationRoot,
} from '../../src/runtime/utils/docs'

const createSlotStub = (tag = 'div') => defineComponent({
  setup(_, { slots, attrs }) {
    return () => h(tag, attrs, slots.default?.())
  },
})

const vuetifyStubs = {
  'v-tabs': createSlotStub('div'),
  'v-tab': defineComponent({
    props: { to: { type: String, default: undefined } },
    setup(props, { slots }) {
      return () => h('a', { href: props.to, role: 'tab' }, slots.default?.())
    },
  }),
  'v-list': createSlotStub('ul'),
  'v-list-group': defineComponent({
    setup(_, { slots }) {
      return () => h('div', [
        slots.activator?.({ props: {} }),
        slots.default?.(),
      ])
    },
  }),
  'v-list-item': defineComponent({
    props: {
      title: { type: String, default: '' },
      to: { type: String, default: undefined },
      active: { type: Boolean, default: false },
    },
    emits: ['click'],
    setup(props, { slots, emit }) {
      return () => h('li', {
        'data-to': props.to,
        'data-active': String(props.active),
        'onClick': (e: Event) => emit('click', e),
      }, [props.title, slots.default?.()])
    },
  }),
  'v-breadcrumbs': defineComponent({
    props: { items: { type: Array, default: () => [] } },
    setup(props, { slots }) {
      return () => h(
        'ol',
        (props.items as Array<{ title: string }>).map(item =>
          h('li', slots.title ? slots.title({ item }) : item.title),
        ),
      )
    },
  }),
  'v-icon': true,
  'v-divider': true,
  'v-row': createSlotStub('div'),
  'v-col': createSlotStub('div'),
  'v-card': defineComponent({
    props: { to: { type: String, default: undefined } },
    setup(props, { slots }) {
      return () => h('a', { href: props.to }, slots.default?.())
    },
  }),
  'v-btn': defineComponent({
    emits: ['click'],
    setup(_, { slots, emit, attrs }) {
      return () => h('button', { ...attrs, onClick: (e: Event) => emit('click', e) }, slots.default?.())
    },
  }),
  'v-expand-transition': createSlotStub('div'),
  'v-navigation-drawer': defineComponent({
    props: { modelValue: { type: Boolean, default: false } },
    setup(props, { slots }) {
      return () => h('aside', { 'data-open': String(props.modelValue) }, slots.default?.())
    },
  }),
}

function mountDocsComponent(component: Component, props: Record<string, unknown>) {
  return mountSuspended(component, {
    props,
    global: {
      components: {
        DocsSidebar,
        PageToc,
      },
      stubs: vuetifyStubs,
    },
  })
}

const sampleRawTree: ContentNavigationItem[] = [
  {
    title: 'Docs',
    path: '/docs',
    stem: 'docs',
    page: false,
    children: [
      {
        title: 'Get Started',
        path: '/docs/getting-started',
        icon: 'mdi-rocket-launch-outline',
        page: false,
        children: [
          {
            title: 'Introduction',
            path: '/docs/getting-started/introduction',
            icon: 'mdi-information-outline',
          },
          {
            title: 'Installation',
            path: '/docs/getting-started/installation',
            icon: 'mdi-download-outline',
          },
        ],
      },
      {
        title: 'Guide',
        path: '/docs/guide',
        icon: 'mdi-book-open-outline',
        page: false,
        children: [
          {
            title: 'Authoring Docs',
            path: '/docs/guide/authoring',
          },
          {
            title: 'Directory Structure',
            path: '/docs/guide/directory-structure',
            page: false,
            children: [
              {
                title: 'Folder Conventions',
                path: '/docs/guide/directory-structure/overview',
              },
            ],
          },
        ],
      },
    ],
  },
]

describe('docs utilities', () => {
  it('unwraps /docs root container and rewrites custom prefixes', () => {
    const defaultTree = unwrapDocsNavigationRoot(sampleRawTree, '/docs')
    expect(defaultTree).toHaveLength(2)
    expect(defaultTree[0]?.path).toBe('/docs/getting-started')

    const customTree = unwrapDocsNavigationRoot(sampleRawTree, '/handbook')
    expect(customTree[0]?.path).toBe('/handbook/getting-started')
    expect(customTree[0]?.children?.[0]?.path).toBe('/handbook/getting-started/introduction')
    expect(customTree[1]?.children?.[1]?.children?.[0]?.path).toBe('/handbook/guide/directory-structure/overview')
  })

  it('converts between public docs routes and /docs collection paths', () => {
    expect(toDocsPublicPath('/docs/guide/authoring', '/handbook')).toBe('/handbook/guide/authoring')
    expect(toDocsContentPath('/handbook/guide/authoring', '/handbook')).toBe('/docs/guide/authoring')
    expect(toDocsContentPath('/handbook', '/handbook')).toBe('/docs')
  })

  it('resolves first leaf page and folder nodes across nested groups', () => {
    const tree = unwrapDocsNavigationRoot(sampleRawTree, '/docs')
    const first = findFirstDocLeaf(tree)
    expect(first?.path).toBe('/docs/getting-started/introduction')

    const guideNode = resolveDocNavNode(tree, '/docs/guide')
    expect(guideNode?.title).toBe('Guide')
    expect(findFirstDocLeaf(guideNode?.children || [])?.path).toBe('/docs/guide/authoring')
  })

  it('splits navigation into top category tabs and active sidebar items', () => {
    const tree = unwrapDocsNavigationRoot(sampleRawTree, '/docs')
    const state = splitDocsNavigation(tree, '/docs/guide/directory-structure/overview')

    expect(state.categories).toEqual([
      {
        title: 'Get Started',
        path: '/docs/getting-started',
        to: '/docs/getting-started/introduction',
        icon: 'mdi-rocket-launch-outline',
        active: false,
      },
      {
        title: 'Guide',
        path: '/docs/guide',
        to: '/docs/guide/authoring',
        icon: 'mdi-book-open-outline',
        active: true,
      },
    ])
    expect(state.activeCategory?.title).toBe('Guide')
    expect(state.sidebarItems).toHaveLength(2)
    expect(state.sidebarItems[1]?.title).toBe('Directory Structure')
  })

  it('falls back to flat sidebar navigation without top tabs when there are no category folders', () => {
    const flatTree: ContentNavigationItem[] = [
      { title: 'Overview', path: '/docs/overview' },
      { title: 'FAQ', path: '/docs/faq' },
    ]
    const state = splitDocsNavigation(flatTree, '/docs/overview')
    expect(state.categories).toEqual([])
    expect(state.activeCategory).toBeNull()
    expect(state.sidebarItems).toEqual(flatTree)
  })

  it('builds hierarchical breadcrumbs and rewrites prev/next surroundings', () => {
    const tree = unwrapDocsNavigationRoot(sampleRawTree, '/docs')
    const crumbs = buildDocsBreadcrumbs(tree, '/docs/guide/directory-structure/overview')
    expect(crumbs).toEqual([
      { title: 'Guide', to: '/docs/guide/authoring' },
      { title: 'Directory Structure', to: '/docs/guide/directory-structure/overview' },
      { title: 'Folder Conventions', disabled: true },
    ])

    const [prev, next] = rewriteDocsSurroundings([
      { title: 'Authoring Docs', path: '/docs/guide/authoring' },
      null,
    ], '/handbook')
    expect(prev?.path).toBe('/handbook/guide/authoring')
    expect(next).toBeNull()
  })
})

describe('docs & TOC components', () => {
  it('renders PageToc h2/h3 headings, emits select with active transition, and reacts to links updates', async () => {
    const wrapper = await mountDocsComponent(PageToc, {
      title: 'On this page',
      links: [
        {
          id: 'overview',
          depth: 2,
          text: 'Overview',
          children: [
            { id: 'key-capabilities', depth: 3, text: 'Key Capabilities' },
          ],
        },
        { id: 'modular-design', depth: 2, text: 'Modular Design' },
      ],
    })

    const nestedLink = wrapper.find('a[href="#key-capabilities"]')
    expect(nestedLink.exists()).toBe(true)
    expect(wrapper.find('a[href="#overview"]').classes()).toContain('page-toc__link--active')

    await nestedLink.trigger('click')
    expect(wrapper.emitted('select')).toEqual([['key-capabilities']])
    expect(nestedLink.classes()).toContain('page-toc__link--active')

    await wrapper.setProps({
      links: [
        { id: 'api-reference', depth: 2, text: 'API Reference' },
      ],
    })
    expect(wrapper.find('a[href="#api-reference"]').classes()).toContain('page-toc__link--active')
  })

  it('tracks indicator direction and locks intermediate scrollspy updates during click smooth scroll', async () => {
    const observerState: { callback?: IntersectionObserverCallback } = {}
    const observedTargets: Element[] = []

    class MockIntersectionObserver {
      constructor(cb: IntersectionObserverCallback) {
        observerState.callback = cb
      }

      observe(target: Element) {
        observedTargets.push(target)
      }

      disconnect() {}
      unobserve() {}
      takeRecords() { return [] }
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

    const headings = ['intro', 'setup', 'usage'].map((id) => {
      const el = document.createElement('h2')
      el.id = id
      el.scrollIntoView = vi.fn()
      document.body.appendChild(el)
      return el
    })

    try {
      const wrapper = await mountDocsComponent(PageToc, {
        title: 'On this page',
        links: [
          {
            id: 'intro',
            depth: 2,
            text: 'Intro',
            children: [
              { id: 'setup', depth: 3, text: 'Setup' },
            ],
          },
          { id: 'usage', depth: 2, text: 'Usage' },
        ],
      })

      const listEl = wrapper.find('.page-toc__list').element as HTMLElement
      listEl.getBoundingClientRect = () => ({ top: 100, bottom: 190, height: 90, left: 0, right: 200, width: 200, x: 0, y: 100, toJSON: () => ({}) })

      const anchorRects: Record<string, { top: number, bottom: number }> = {
        '#intro': { top: 100, bottom: 130 },
        '#setup': { top: 130, bottom: 160 },
        '#usage': { top: 160, bottom: 190 },
      }
      for (const [href, box] of Object.entries(anchorRects)) {
        const el = wrapper.find(`a[href="${href}"]`).element as HTMLElement
        el.getBoundingClientRect = () => ({
          top: box.top,
          bottom: box.bottom,
          height: 30,
          left: 0,
          right: 200,
          width: 200,
          x: 0,
          y: box.top,
          toJSON: () => ({}),
        })
      }

      // Click nested #setup so initial rail geometry and indentation bend are built
      await wrapper.find('a[href="#setup"]').trigger('click')
      await nextTick()
      const rail = wrapper.find('.page-toc__rail')
      const trackPath = wrapper.find('.page-toc__track-path')
      const activePath = wrapper.find('.page-toc__active-path')
      expect(rail.exists()).toBe(true)
      expect(rail.attributes('height')).toBe('90')
      const gradientStops = rail.findAll('linearGradient stop')
      expect(gradientStops).toHaveLength(3)
      expect(gradientStops[1]?.attributes('offset')).toBe('64%')
      expect(trackPath.attributes('stroke')).toMatch(/^url\(#toc-rail-fade-/)
      expect(wrapper.find('.page-toc__list').classes()).toContain('page-toc__list--has-fade')
      expect(wrapper.find('.page-toc__list').attributes('style')).toContain('--toc-fade-start: 64%')
      expect(activePath.attributes('d')).toContain('L 11 ')
      const dashParts = (activePath.attributes('style') || '').match(/stroke-dasharray:\s*([\d.]+)/)
      expect(Number(dashParts?.[1] || 0)).toBeGreaterThan(30)

      // Moving down to #usage sets direction="down" and locks observer during smooth scroll
      await wrapper.find('a[href="#usage"]').trigger('click')
      await nextTick()
      expect(wrapper.find('.page-toc__active-path').attributes('data-direction')).toBe('down')
      expect(wrapper.find('.page-toc__list').classes()).not.toContain('page-toc__list--has-fade')

      // Intermediate IntersectionObserver crossings do not override clicked section while locked
      expect(observedTargets.length).toBeGreaterThanOrEqual(3)
      observerState.callback?.(
        [
          { target: headings[1]!, isIntersecting: true } as unknown as IntersectionObserverEntry,
          { target: headings[2]!, isIntersecting: false } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      )
      await nextTick()
      expect(wrapper.find('a[href="#usage"]').classes()).toContain('page-toc__link--active')

      // Clicking back up to #intro sets direction="up"
      await wrapper.find('a[href="#intro"]').trigger('click')
      await nextTick()
      expect(wrapper.find('.page-toc__active-path').attributes('data-direction')).toBe('up')

      // Finishing scroll unlocks observer updates again
      window.dispatchEvent(new Event('scrollend'))
      observerState.callback?.(
        [
          { target: headings[0]!, isIntersecting: false } as unknown as IntersectionObserverEntry,
          { target: headings[1]!, isIntersecting: true } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      )
      await nextTick()
      expect(wrapper.find('a[href="#setup"]').classes()).toContain('page-toc__link--active')
      expect(wrapper.find('.page-toc__active-path').attributes('data-direction')).toBe('down')

      wrapper.unmount()
    }
    finally {
      vi.unstubAllGlobals()
      for (const el of headings) el.remove()
    }
  })

  it('renders DocsTabs for top-level categories', async () => {
    const wrapper = await mountDocsComponent(DocsTabs, {
      categories: [
        {
          title: 'Get Started',
          path: '/docs/getting-started',
          to: '/docs/getting-started/introduction',
          icon: 'mdi-rocket-launch-outline',
          active: true,
        },
        {
          title: 'API',
          path: '/docs/api',
          to: '/docs/api/composables',
          icon: 'mdi-code-tags',
          active: false,
        },
      ],
    })

    expect(wrapper.text()).toContain('Get Started')
    expect(wrapper.text()).toContain('API')
    expect(wrapper.find('a[href="/docs/getting-started/introduction"]').exists()).toBe(true)
  })

  it('renders DocsSidebar with a single nav landmark, active highlight, and navigate emit', async () => {
    const tree = unwrapDocsNavigationRoot(sampleRawTree, '/docs')
    const guideItems = tree[1]?.children || []

    const wrapper = await mountDocsComponent(DocsSidebar, {
      items: guideItems,
      currentPath: '/docs/guide/directory-structure/overview',
    })

    // Recursive nested subgroups render inside a div rather than nesting <nav> landmarks
    expect(wrapper.findAll('nav')).toHaveLength(1)
    expect(wrapper.text()).toContain('Authoring Docs')
    expect(wrapper.text()).toContain('Directory Structure')

    const nestedItem = wrapper.find('li[data-to="/docs/guide/directory-structure/overview"]')
    expect(nestedItem.attributes('data-active')).toBe('true')
    await nestedItem.trigger('click')
    expect(wrapper.emitted('navigate')).toEqual([['/docs/guide/directory-structure/overview']])
  })

  it('renders DocsTitle breadcrumbs inside nav landmark alongside title and description', async () => {
    const wrapper = await mountDocsComponent(DocsTitle, {
      title: 'Introduction',
      description: 'Get started with Nuxtify CMS.',
      breadcrumbs: [
        { title: 'Get Started', to: '/docs/getting-started/introduction' },
        { title: 'Introduction', disabled: true },
      ],
    })

    expect(wrapper.find('nav[aria-label="Breadcrumbs"]').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('Introduction')
    expect(wrapper.text()).toContain('Get Started')
    expect(wrapper.text()).toContain('Get started with Nuxtify CMS.')
  })

  it('renders DocsPrevNext prev/next cards and hides when empty', async () => {
    const emptyWrapper = await mountDocsComponent(DocsPrevNext, {
      prev: null,
      next: null,
    })
    expect(emptyWrapper.find('nav').exists()).toBe(false)

    const wrapper = await mountDocsComponent(DocsPrevNext, {
      prev: { title: 'Introduction', path: '/docs/getting-started/introduction', description: 'Intro desc' },
      next: { title: 'Configuration', path: '/docs/getting-started/configuration' },
    })

    expect(wrapper.text()).toContain('Previous')
    expect(wrapper.text()).toContain('Introduction')
    expect(wrapper.text()).toContain('Next')
    expect(wrapper.text()).toContain('Configuration')
  })

  it('renders DocsMobileBar with sibling drawer, toggles menu & inline TOC, and resets on route change', async () => {
    const tree = unwrapDocsNavigationRoot(sampleRawTree, '/docs')
    const wrapper = await mountDocsComponent(DocsMobileBar, {
      sidebarItems: tree[0]?.children || [],
      tocLinks: [{ id: 'overview', depth: 2, text: 'Overview' }],
      currentPath: '/docs/getting-started/introduction',
      hasTabs: true,
      showMenu: true,
      showToc: true,
    })

    const bar = wrapper.find('.docs-mobile-bar')
    expect(bar.classes()).toContain('docs-mobile-bar--with-tabs')
    // Drawer must be outside sticky backdrop-filter container
    expect(bar.find('aside').exists()).toBe(false)
    expect(wrapper.find('aside').attributes('data-open')).toBe('false')
    expect(wrapper.find('.docs-mobile-bar__toc').exists()).toBe(false)

    const buttons = wrapper.findAll('.docs-mobile-bar__inner button')
    await buttons[0]?.trigger('click')
    expect(wrapper.find('aside').attributes('data-open')).toBe('true')

    await buttons[1]?.trigger('click')
    expect(wrapper.find('.docs-mobile-bar__toc').exists()).toBe(true)

    await wrapper.setProps({ currentPath: '/docs/getting-started/installation' })
    expect(wrapper.find('aside').attributes('data-open')).toBe('false')
    expect(wrapper.find('.docs-mobile-bar__toc').exists()).toBe(false)
  })
})
