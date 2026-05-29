<script setup lang="ts">
import type { Contributor } from '../../types/content'
import { honoraryName } from '#imports'

defineProps<{
  author: Contributor
  timestamp: string | Date
  updated?: boolean
  hideTimestampText?: boolean
}>()
</script>

<template>
  <div class="text-body-2 text-medium-emphasis d-flex align-center ga-2">
    <!-- Avatar -->
    <NuxtImg
      v-if="author.image"
      :src="author.image.src"
      :alt="author.image.alt"
      width="32"
      height="32"
      format="webp"
      densities="x1 x2"
      class="rounded-circle"
    />

    <!-- Author -->
    <span>
      by
      <NuxtLink :to="author.path">
        {{ honoraryName(author.name, author.honorificSuffix) }}
      </NuxtLink>
    </span>

    ·

    <!-- Date -->
    <span>
      {{ hideTimestampText ? '' : (updated ? 'Updated' : 'Published') }}
      <NuxtTime
        :datetime="timestamp"
        year="numeric"
        month="short"
        day="numeric"
      />
    </span>
  </div>
</template>

<style scoped>
a {
  color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
  text-decoration: underline;
  text-decoration-color: rgb(var(--v-theme-secondary));
  text-underline-offset: 4px;
}
a:hover {
  color: rgb(var(--v-theme-secondary));
  text-decoration: none;
}
</style>
