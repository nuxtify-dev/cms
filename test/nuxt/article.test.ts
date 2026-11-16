import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import ArticleMobileToc from '../../src/runtime/components/article/ArticleMobileToc.vue'
import ArticleTitle from '../../src/runtime/components/article/ArticleTitle.vue'
import PageToc from '../../src/runtime/components/page/PageToc.vue'
import { articleSchema } from '../../src/runtime/utils/contentSchemas'
import { isTocEnabled } from '../../src/runtime/utils/toc/rail'

const createSlotStub = (tag = 'div') => defineComponent({
  setup(_, { slots, attrs }) {
    return () => h(tag, attrs, slots.default?.())
  },
})

const articleStubs = {
  'v-icon': defineComponent({
    props: { icon: { type: String, default: '' } },
    setup(props) {
      return () => h('span', { 'data-icon': props.icon })
    },
  }),
  'v-expand-transition': createSlotStub('div'),
}

describe('article schema and TOC', () => {
  it('defaults articleSchema.toc to true and allows opting out', () => {
    const parsedDefault = articleSchema.parse({
      publishedAt: '2026-10-10',
      author: 'sparky',
    })
    expect(parsedDefault.toc).toBe(true)

    const parsedOptOut = articleSchema.parse({
      publishedAt: '2026-10-10',
      author: 'sparky',
      toc: false,
    })
    expect(parsedOptOut.toc).toBe(false)
  })

  it('evaluates isTocEnabled with heading count threshold, config flag, and page opt-out', () => {
    expect(isTocEnabled({
      links: [{ id: 'only-one', depth: 2, text: 'Only One' }],
      minHeadings: 2,
    })).toBe(false)

    expect(isTocEnabled({
      links: [
        {
          id: 'parent',
          depth: 2,
          text: 'Parent',
          children: [{ id: 'child', depth: 3, text: 'Child' }],
        },
      ],
      minHeadings: 2,
    })).toBe(true)

    expect(isTocEnabled({
      links: [
        { id: 'one', depth: 2, text: 'One' },
        { id: 'two', depth: 2, text: 'Two' },
      ],
      pageToc: false,
      minHeadings: 2,
    })).toBe(false)

    expect(isTocEnabled({
      links: [
        { id: 'one', depth: 2, text: 'One' },
        { id: 'two', depth: 2, text: 'Two' },
      ],
      configEnabled: false,
      minHeadings: 2,
    })).toBe(false)
  })

  it('renders ArticleTitle inside a header without an outer grid wrapper', async () => {
    const wrapper = await mountSuspended(ArticleTitle, {
      props: {
        title: 'Hello Article',
        description: 'Article subtitle',
      },
      slots: {
        overline: 'Guides',
        default: 'Byline slot',
      },
    })

    expect(wrapper.element.tagName).toBe('HEADER')
    expect(wrapper.find('h1').text()).toBe('Hello Article')
    expect(wrapper.text()).toContain('Article subtitle')
    expect(wrapper.text()).toContain('Guides')
    expect(wrapper.text()).toContain('Byline slot')
  })

  it('renders ArticleMobileToc collapsed by default, stays open on link select, and closes on route change', async () => {
    const emptyWrapper = await mountSuspended(ArticleMobileToc, {
      props: { links: [] },
      global: {
        components: { PageToc },
        stubs: articleStubs,
      },
    })
    expect(emptyWrapper.find('.article-mobile-toc').exists()).toBe(false)

    const wrapper = await mountSuspended(ArticleMobileToc, {
      props: {
        title: 'In this article',
        currentPath: '/articles/getting-started',
        links: [
          {
            id: 'overview',
            depth: 2,
            text: 'Overview',
            children: [{ id: 'setup', depth: 3, text: 'Setup' }],
          },
          { id: 'next-steps', depth: 2, text: 'Next Steps' },
        ],
      },
      global: {
        components: { PageToc },
        stubs: articleStubs,
      },
    })

    const toggleBtn = wrapper.find('button.article-mobile-toc__toggle')
    expect(toggleBtn.text()).toContain('In this article')
    expect(toggleBtn.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('#article-mobile-toc-panel').exists()).toBe(false)

    await toggleBtn.trigger('click')
    expect(toggleBtn.attributes('aria-expanded')).toBe('true')
    const panel = wrapper.find('#article-mobile-toc-panel')
    expect(panel.exists()).toBe(true)
    expect(panel.find('.page-toc--inline').exists()).toBe(true)
    expect(panel.find('a[href="#setup"]').exists()).toBe(true)

    await panel.find('a[href="#setup"]').trigger('click')
    expect(toggleBtn.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('#article-mobile-toc-panel').exists()).toBe(true)

    await wrapper.setProps({ currentPath: '/articles/other-post' })
    expect(toggleBtn.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('#article-mobile-toc-panel').exists()).toBe(false)
  })
})
