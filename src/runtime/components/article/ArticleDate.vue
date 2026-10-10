<script setup lang="ts">
import { computed } from '#imports'

const props = withDefaults(
  defineProps<{
    timestamp: string | Date
    updated?: boolean
    hideTimestampText?: boolean
    monthFormat?: 'short' | 'long'
    readTime?: number | string
  }>(),
  {
    updated: false,
    hideTimestampText: false,
    monthFormat: 'short',
  },
)

const formattedReadTime = computed(() => {
  if (props.readTime === undefined || props.readTime === null || props.readTime === '') {
    return undefined
  }

  if (typeof props.readTime === 'number') {
    if (props.readTime < 1) {
      return '< 1 min read'
    }
    return `${Math.round(props.readTime)} min read`
  }

  const str = String(props.readTime).trim()
  if (str.toLowerCase().includes('read') || str.toLowerCase().includes('min')) {
    return str
  }

  if (str === '< 1' || str === '<1') {
    return '< 1 min read'
  }

  const num = Number(str)
  if (!Number.isNaN(num)) {
    if (num < 1) {
      return '< 1 min read'
    }
    return `${Math.round(num)} min read`
  }

  return `${str} min read`
})
</script>

<template>
  <div class="text-body-2 text-medium-emphasis text-end">
    <div>
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
    <div
      v-if="formattedReadTime"
      class="text-caption text-medium-emphasis"
    >
      {{ formattedReadTime }}
    </div>
  </div>
</template>
