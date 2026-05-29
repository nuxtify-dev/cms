<script setup lang="ts">
import type { VCard } from 'vuetify/components'
import type { PageLink } from '../../../types/link'

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  caption?: string
  links?: Array<PageLink>
  variant?: VCard['$props']['variant']
  color?: string
  align?: 'left' | 'center' | 'right'
}>(), {
  variant: 'outlined',
  color: 'secondary',
  align: 'center',
})

const slots = useSlots()
const { textAlign, justify } = useAlignment(toRef(props, 'align'))

const hasContent = computed(() => !!(props.title || slots.title || props.description || slots.description))
</script>

<template>
  <v-card
    :variant
    :color
    :class="[
      'px-6',
      textAlign,
      hasContent ? 'py-12 my-6 my-md-12' : 'py-6 my-3 my-md-6',
    ]"
  >
    <v-container class="pa-0">
      <v-row :justify>
        <v-col cols="12">
          <h2
            v-if="title || $slots.title"
            class="text-primary text-h5 text-md-h4 font-weight-bold mt-0 mb-4"
          >
            <slot
              name="title"
              mdc-unwrap="p"
            >
              {{ title }}
            </slot>
          </h2>
          <div
            v-if="description || $slots.description"
            class="text-subtitle-1 text-md-h6 text-medium-emphasis mb-6"
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
              class="d-flex flex-wrap align-center"
              :class="`justify-${justify}`"
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

          <div
            v-if="$slots.default"
            class="mt-8"
          >
            <slot />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>
