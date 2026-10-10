<script setup lang="ts">
withDefaults(
  defineProps<{
    timestamp: string | Date
    updated?: boolean
    hideTimestampText?: boolean
    monthFormat?: 'short' | 'long'
  }>(),
  {
    updated: false,
    hideTimestampText: false,
    monthFormat: 'long',
  },
)
</script>

<template>
  <div class="text-body-2 text-medium-emphasis text-end">
    <span v-if="!hideTimestampText">
      {{ updated ? 'Updated ' : 'Published ' }}
    </span>
    <NuxtTime
      :datetime="timestamp"
      year="numeric"
      :month="monthFormat"
      day="numeric"
    />
  </div>
</template>
