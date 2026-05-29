<script setup lang="ts">
import type { VCard } from 'vuetify/components'
import type { PageLink } from '../../../types/link'

defineProps<{
  title?: string
  description?: string
  link?: PageLink
  variant?: VCard['$props']['variant']
  color?: string
}>()
</script>

<template>
  <v-col
    cols="12"
    sm="6"
    md="4"
  >
    <v-card
      :to="link?.to"
      :href="link?.href"
      :target="link?.target"
      :rel="link?.rel"
      :variant="variant || 'outlined'"
      :color
      :hover="!!link?.to"
      class="h-100"
    >
      <slot name="prepend">
        <div
          v-if="link?.prependIcon"
          class="text-center mt-4"
        >
          <v-icon
            :icon="link?.prependIcon"
            size="large"
          />
        </div>
      </slot>

      <v-card-item>
        <v-card-title
          v-if="title || $slots.title"
          class="text-wrap text-center text-h6 text-md-h5 mt-0"
          tag="h3"
        >
          <slot
            name="title"
            mdc-unwrap="p"
          >
            {{ title }}
          </slot>
        </v-card-title>

        <v-card-subtitle
          class="text-subtitle-1"
          style="white-space: pre-line;"
        >
          <slot
            name="description"
            mdc-unwrap="p"
          >
            {{ description }}
          </slot>
        </v-card-subtitle>
      </v-card-item>

      <v-card-text v-if="$slots.text">
        <slot name="text" />
      </v-card-text>

      <v-card-actions v-if="$slots.actions">
        <slot name="actions" />
      </v-card-actions>

      <slot name="append">
        <div
          v-if="link?.appendIcon"
          class="text-center mt-4"
        >
          <v-icon
            :icon="link?.appendIcon"
            size="large"
          />
        </div>
      </slot>
    </v-card>
  </v-col>
</template>
