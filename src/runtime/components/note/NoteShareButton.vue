<script setup lang="ts">
import { useShare } from '@vueuse/core'
import { useSiteConfig, useCopyText } from '#imports'

// PROPS
const props = defineProps<{
  path: string
  title: string
  text: string
}>()

// STATE - GLOBAL
const { share, isSupported } = useShare()
const siteConfig = useSiteConfig()

// METHODS
const clickShare = () => {
  const url = `${siteConfig.url}${props.path}`
  if (isSupported) {
    share({
      title: props.title,
      text: props.text,
      url,
    })
  }
  else {
    useCopyText(url, 'Link')
  }
}
</script>

<template>
  <v-btn
    prepend-icon="mdi-share"
    color="primary"
    @click="clickShare"
  >
    Share
  </v-btn>
</template>
