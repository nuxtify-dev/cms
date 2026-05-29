<script setup lang="ts">
withDefaults(defineProps<{
  to: string
  title?: string
  description?: string
  buttonText?: string
}>(), {
  title: '',
  description: '',
  buttonText: 'Learn more',
})
</script>

<template>
  <v-card
    :to
    hover
    link
    class="rounded-xl pa-4 fill-height d-flex flex-column"
  >
    <v-card-title class="text-h5 font-weight-bold text-primary text-wrap">
      {{ title }}
    </v-card-title>

    <v-card-text class="text-body-1 text-medium-emphasis mt-2">
      {{ description }}
    </v-card-text>

    <v-card-actions class="mt-auto">
      <v-btn
        variant="text"
        color="secondary"
        append-icon="mdi-arrow-right"
      >
        {{ buttonText }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
