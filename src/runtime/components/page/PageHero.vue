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
  caption?: string
  links?: Array<PageLink>
  align?: 'left' | 'center' | 'right'
}>()

const { justify, textAlign } = useAlignment(toRef(props, 'align'))
</script>

<template>
  <section
    class="d-flex align-center justify-center"
    style="height: 70vh"
  >
    <v-row
      :justify
      :class="textAlign"
    >
      <v-col cols="12">
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
          class="text-h4 text-sm-h3 text-md-h2 font-weight-bold"
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
          class="text-subtitle-1 text-md-h6 text-medium-emphasis mt-2"
        >
          <slot
            name="description"
            mdc-unwrap="p"
          >
            {{ description }}
          </slot>
        </div>

        <div
          v-if="links?.length || $slots.actions"
          :class="`d-flex justify-${justify} mt-8`"
        >
          <slot name="actions">
            <div
              class="d-flex flex-wrap align-center"
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
        </div>

        <div
          v-if="caption"
          class="text-body-2 text-medium-emphasis mt-2"
        >
          <slot
            name="caption"
            mdc-unwrap="p"
          >
            {{ caption }}
          </slot>
        </div>

        <slot />
      </v-col>
    </v-row>
  </section>
</template>

<style scoped>
h1 {
  line-height: 1.3;
}
</style>
