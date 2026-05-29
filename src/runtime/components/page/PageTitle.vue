<script setup lang="ts">
import type { PageLink } from '../../../types/link'
import {
  useAlignment,
  toRef,
} from '#imports'

const props = defineProps<{
  overline?: string
  title?: string
  description?: string
  links?: Array<PageLink>
  align?: 'left' | 'center' | 'right'
}>()

const { textAlign } = useAlignment(toRef(props, 'align'))
</script>

<template>
  <v-row
    justify="center"
    :class="textAlign"
    class="py-4 py-md-16"
  >
    <v-col
      cols="12"
      md="10"
      lg="8"
      xl="5"
    >
      <div
        v-if="overline || $slots.overline"
        class="text-subtitle-1 text-md-h6 mb-2"
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
        class="text-h4 text-md-h3 font-weight-bold"
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
        class="text-subtitle-1 text-md-h6 text-medium-emphasis mt-2 mt-md-4"
      >
        <slot
          name="description"
          mdc-unwrap="p"
        >
          {{ description }}
        </slot>
      </div>

      <slot name="actions">
        <div
          v-if="links?.length"
          class="d-flex flex-wrap justify-center align-center mt-4"
          style="gap: 16px;"
        >
          <v-btn
            v-for="link in links"
            :key="link.text"
            :to="link.to"
            :href="link.href"
            :color="link.color"
            :variant="link.variant || 'flat'"
            :rounded="link.rounded"
            :prepend-icon="link.prependIcon"
            :append-icon="link.appendIcon"
            :size="link.size"
            :target="link.target"
            :rel="link.rel"
          >
            {{ link.text }}
          </v-btn>
        </div>
      </slot>

      <slot />
    </v-col>
  </v-row>
</template>
