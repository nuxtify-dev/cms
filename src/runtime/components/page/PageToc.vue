<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useTocScrollspy } from '../../composables/toc/useTocScrollspy'
import {
  computeTocRail,
  createEmptyTocRailState,
  flattenTocItems,
  type PageTocLink,
} from '../../utils/toc/rail'

export type { PageTocLink }

const props = withDefaults(defineProps<{
  links?: PageTocLink[]
  title?: string
  inline?: boolean
}>(), {
  links: () => [],
  title: 'On this page',
  inline: false,
})

const emit = defineEmits<{
  select: [id: string]
}>()

const trackGradientId = `toc-rail-fade-${useId()}`
const flattenedItems = computed(() => flattenTocItems(props.links))
const flattenedIds = computed(() => flattenedItems.value.map(item => item.id))

const { activeId, startObserver, stopScrollLock, scrollToId } = useTocScrollspy(flattenedIds)

const listRef = ref<HTMLUListElement | null>(null)
const linkEls = new Map<string, HTMLElement>()
const railState = ref(createEmptyTocRailState())

let lastActiveTop: number | null = null
let resizeObserver: ResizeObserver | null = null
let suppressNextAnimation = false

function setLinkRef(id: string, el: unknown) {
  if (el && typeof (el as HTMLElement).getBoundingClientRect === 'function') {
    linkEls.set(id, el as HTMLElement)
  }
  else {
    linkEls.delete(id)
  }
}

function updateRail(animate = true) {
  const result = computeTocRail(
    listRef.value,
    linkEls,
    flattenedItems.value,
    activeId.value,
    lastActiveTop,
    animate,
  )
  lastActiveTop = result.activeTop
  railState.value = result.state
}

function handleClick(id: string, event: MouseEvent) {
  event.preventDefault()
  emit('select', id)
  scrollToId(id)
}

onMounted(() => {
  startObserver()
  nextTick(() => updateRail(false))
  if (import.meta.client && typeof ResizeObserver !== 'undefined' && listRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateRail(false)
    })
    resizeObserver.observe(listRef.value)
  }
})

watch(
  activeId,
  () => {
    const animate = !suppressNextAnimation
    suppressNextAnimation = false
    updateRail(animate)
  },
  { flush: 'post' },
)

watch(
  () => props.links,
  () => {
    stopScrollLock()
    suppressNextAnimation = true
    lastActiveTop = null
    startObserver()
    nextTick(() => {
      suppressNextAnimation = false
      updateRail(false)
    })
  },
  { deep: true, flush: 'post' },
)

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>

<template>
  <nav
    v-if="links.length > 0"
    :aria-label="title || 'On this page'"
    :class="['page-toc', { 'page-toc--inline': inline }]"
  >
    <p
      v-if="title"
      class="page-toc__title text-body-2 font-weight-semibold mb-3"
    >
      {{ title }}
    </p>

    <ul
      ref="listRef"
      :class="[
        'page-toc__list',
        {
          'page-toc__list--has-rail': railState.visible,
          'page-toc__list--has-fade': railState.visible && flattenedIds.length > 1 && activeId !== flattenedIds[flattenedIds.length - 1],
        },
      ]"
      :style="railState.visible ? { '--toc-fade-start': railState.fadeOffset } : undefined"
    >
      <svg
        v-if="railState.visible"
        class="page-toc__rail"
        :width="railState.width"
        :height="railState.height"
        :viewBox="`0 0 ${railState.width} ${railState.height}`"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            :id="trackGradientId"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="0"
            :y2="railState.height"
          >
            <stop
              offset="0%"
              stop-color="currentColor"
              stop-opacity="1"
            />
            <stop
              :offset="railState.fadeOffset"
              stop-color="currentColor"
              stop-opacity="1"
            />
            <stop
              offset="100%"
              stop-color="currentColor"
              stop-opacity="0"
            />
          </linearGradient>
        </defs>

        <path
          class="page-toc__track-path"
          :d="railState.pathD"
          :stroke="`url(#${trackGradientId})`"
        />

        <path
          :class="['page-toc__active-path', { 'page-toc__active-path--animated': railState.animate }]"
          :d="railState.pathD"
          :data-direction="railState.direction"
          :style="{
            strokeDasharray: `${railState.dashLength} ${railState.totalLength + railState.dashLength}`,
            strokeDashoffset: `${railState.dashOffset}`,
          }"
        />
      </svg>

      <li
        v-for="link in links"
        :key="link.id"
        class="page-toc__item"
      >
        <a
          :ref="(el) => setLinkRef(link.id, el)"
          :href="`#${link.id}`"
          :class="['page-toc__link', { 'page-toc__link--active': activeId === link.id }]"
          @click="handleClick(link.id, $event)"
        >
          {{ link.text }}
        </a>

        <ul
          v-if="link.children?.length"
          class="page-toc__sublist"
        >
          <li
            v-for="child in link.children"
            :key="child.id"
            class="page-toc__item"
          >
            <a
              :ref="(el) => setLinkRef(child.id, el)"
              :href="`#${child.id}`"
              :class="['page-toc__link page-toc__link--nested', { 'page-toc__link--active': activeId === child.id }]"
              @click="handleClick(child.id, $event)"
            >
              {{ child.text }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.page-toc__title {
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: 0.01em;
}

.page-toc__list,
.page-toc__sublist {
  list-style: none;
  margin: 0;
  padding: 0;
}

.page-toc__list {
  position: relative;
  border-left: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.page-toc__list--has-rail {
  border-left-color: transparent;
}

.page-toc__list--has-fade {
  mask-image: linear-gradient(
    to bottom,
    #000 0%,
    #000 var(--toc-fade-start, 100%),
    rgba(0, 0, 0, 0.25) 100%
  );
}

.page-toc__rail {
  position: absolute;
  top: 0;
  left: -1px;
  pointer-events: none;
  overflow: visible;
}

.page-toc__track-path {
  color: rgba(var(--v-border-color), var(--v-border-opacity));
  stroke-width: 1;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.page-toc__active-path {
  stroke: rgb(var(--v-theme-primary));
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.page-toc__active-path--animated {
  transition:
    stroke-dashoffset 0.36s cubic-bezier(0.22, 1, 0.36, 1),
    stroke-dasharray 0.36s cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
  .page-toc__active-path--animated {
    transition: none;
  }
}

.page-toc__link {
  display: block;
  margin-left: -1px;
  padding: 4px 0 4px 14px;
  border-left: 2px solid transparent;
  font-size: 0.84rem;
  line-height: 1.45;
  color: rgba(var(--v-theme-on-surface), 0.7);
  text-decoration: none;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.page-toc__link--nested {
  padding-left: 24px;
  font-size: 0.8125rem;
}

.page-toc__link:hover {
  color: rgb(var(--v-theme-on-surface));
}

.page-toc__link--active {
  color: rgb(var(--v-theme-primary));
  border-left-color: rgb(var(--v-theme-primary));
  font-weight: 500;
}

.page-toc__list--has-rail .page-toc__link--active {
  border-left-color: transparent;
}
</style>
