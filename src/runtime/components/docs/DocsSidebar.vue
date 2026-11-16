<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ContentNavigationItem } from '@nuxt/content'
import { normalizeDocRoutePath } from '../../utils/docs'

const props = withDefaults(defineProps<{
  items?: ContentNavigationItem[]
  currentPath?: string
  nested?: boolean
}>(), {
  items: () => [],
  currentPath: '',
  nested: false,
})

const emit = defineEmits<{
  navigate: [path: string]
}>()

function hasActiveDescendant(item: ContentNavigationItem, normalizedCurrent: string): boolean {
  if (normalizeDocRoutePath(item.path) === normalizedCurrent) return true
  if (Array.isArray(item.children)) {
    return item.children.some(child => hasActiveDescendant(child, normalizedCurrent))
  }
  return false
}

function collectOpenedGroups(items: ContentNavigationItem[], currentPath: string): string[] {
  const normalizedCurrent = normalizeDocRoutePath(currentPath)
  const opened: string[] = []
  for (const item of items) {
    if (Array.isArray(item.children) && item.children.length > 0) {
      if (hasActiveDescendant(item, normalizedCurrent)) {
        opened.push(item.path)
      }
    }
  }
  return opened
}

const openedGroups = ref<string[]>(collectOpenedGroups(props.items, props.currentPath))

watch(
  () => [props.items, props.currentPath] as const,
  ([items, currentPath]) => {
    const activeGroups = collectOpenedGroups(items, currentPath)
    for (const group of activeGroups) {
      if (!openedGroups.value.includes(group)) {
        openedGroups.value = [...openedGroups.value, group]
      }
    }
  },
  { deep: true },
)

function isItemActive(path: string): boolean {
  if (!props.currentPath) return false
  return normalizeDocRoutePath(path) === normalizeDocRoutePath(props.currentPath)
}

function getItemIcon(item: ContentNavigationItem): string | undefined {
  return typeof item.icon === 'string' && item.icon ? item.icon : undefined
}
</script>

<template>
  <component
    :is="nested ? 'div' : 'nav'"
    v-if="items.length > 0"
    :aria-label="nested ? undefined : 'Documentation section navigation'"
    class="docs-sidebar"
  >
    <v-list
      v-model:opened="openedGroups"
      nav
      slim
      density="compact"
      bg-color="transparent"
      class="pa-0 docs-sidebar__list"
    >
      <template
        v-for="item in items"
        :key="item.path"
      >
        <v-list-group
          v-if="item.children?.length"
          :value="item.path"
          fluid
        >
          <template #activator="{ props: activatorProps }">
            <v-list-item
              v-bind="activatorProps"
              :title="item.title"
              :prepend-icon="getItemIcon(item)"
              rounded="lg"
              class="docs-sidebar__group-title"
            />
          </template>

          <template
            v-for="child in item.children"
            :key="child.path"
          >
            <DocsSidebar
              v-if="child.children?.length"
              :items="[child]"
              :current-path="currentPath"
              nested
              @navigate="emit('navigate', $event)"
            />
            <v-list-item
              v-else
              :to="child.path"
              :title="child.title"
              :prepend-icon="getItemIcon(child)"
              :active="isItemActive(child.path)"
              color="primary"
              rounded="lg"
              @click="emit('navigate', child.path)"
            />
          </template>
        </v-list-group>

        <v-list-item
          v-else
          :to="item.path"
          :title="item.title"
          :prepend-icon="getItemIcon(item)"
          :active="isItemActive(item.path)"
          color="primary"
          rounded="lg"
          @click="emit('navigate', item.path)"
        />
      </template>
    </v-list>
  </component>
</template>

<style scoped>
.docs-sidebar__list {
  --v-list-prepend-gap: 8px;
  --v-list-slim-spacer-width: 6px;
}

.docs-sidebar__list :deep(.v-list-item) {
  min-height: 34px;
  padding-inline: 8px;
}

.docs-sidebar__list :deep(.v-list-item__spacer) {
  width: 8px !important;
}

.docs-sidebar__list :deep(.v-list-item__append > .v-icon ~ .v-list-item__spacer) {
  width: 6px !important;
}

.docs-sidebar__list :deep(.v-list-item__prepend > .v-icon) {
  font-size: 1.125rem;
  opacity: 0.78;
}

.docs-sidebar__list :deep(.v-list-item--active .v-list-item__prepend > .v-icon) {
  opacity: 1;
}

.docs-sidebar__list :deep(.v-list-item-title) {
  font-size: 0.875rem;
  line-height: 1.4;
}

.docs-sidebar__list :deep(.v-list-group__items) {
  min-width: 0;
  margin-left: 16px;
  padding-left: 6px;
  border-left: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.docs-sidebar__list :deep(.v-list-group__items .v-list-item) {
  padding-inline-start: 8px !important;
}

.docs-sidebar__group-title :deep(.v-list-item-title) {
  font-weight: 600;
}
</style>
