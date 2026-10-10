<script setup lang="ts">
import type { Contributor } from '../../types/content'
import { honoraryName } from '#imports'

defineProps<{
  author: Contributor
}>()
</script>

<template>
  <div>
    <NuxtLink :to="author.path">
      <div class="d-flex align-center ga-3">
        <!-- Avatar -->
        <NuxtImg
          v-if="author.image"
          :src="author.image.src"
          :alt="author.image.alt"
          width="36"
          height="36"
          format="webp"
          densities="x1 x2"
          class="rounded-circle"
        />

        <!-- Author details -->
        <div class="d-flex flex-column text-body-2">
          <span class="font-weight-bold">
            {{ honoraryName(author.name, author.honorificSuffix) }}
          </span>

          <span
            v-if="author.jobTitle"
            class="text-medium-emphasis"
          >
            {{ author.jobTitle }}
          </span>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<style scoped>
a {
  color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
  text-decoration: none;
}
a:hover {
  color: rgb(var(--v-theme-secondary));
}
</style>
