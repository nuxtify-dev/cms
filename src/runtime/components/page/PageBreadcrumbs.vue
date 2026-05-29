<script setup lang="ts">
import type { BreadcrumbItem } from '../../../types/link'

defineProps<{
  breadcrumbs: BreadcrumbItem[]
}>()
</script>

<template>
  <nav aria-label="Breadcrumbs">
    <v-breadcrumbs
      :items="breadcrumbs"
      class="text-overline text-medium-emphasis ml-n4"
    />
  </nav>
</template>
