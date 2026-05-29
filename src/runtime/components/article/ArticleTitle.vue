<script setup lang="ts">
defineProps<{
  overline?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <v-row
    justify="center"
    class="pt-4 pt-md-10"
  >
    <v-col
      cols="12"
      md="10"
      lg="8"
      xl="5"
    >
      <div
        v-if="overline || $slots.overline"
        class="text-overline text-secondary"
      >
        <slot
          name="overline"
          mdc-unwrap="p"
        >
          {{ overline }}
        </slot>
      </div>

      <h1
        v-if="title || $slots.title"
        class="text-h5 text-md-h4 font-weight-bold"
      >
        <slot
          name="title"
          mdc-unwrap="p"
        >
          {{ title }}
        </slot>
      </h1>

      <div
        v-if="description || $slots.description"
        class="text-subtitle-1 text-medium-emphasis"
      >
        <slot
          name="description"
          mdc-unwrap="p"
        >
          {{ description }}
        </slot>
      </div>

      <slot />
    </v-col>
  </v-row>
</template>
