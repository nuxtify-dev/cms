<script setup lang="ts">
import {
  useAlignment,
  toRef,
} from '#imports'

const props = defineProps<{
  overline?: string
  title?: string
  description?: string
  align?: 'left' | 'center' | 'right'
  hidden?: boolean
}>()

const { justify, textAlign } = useAlignment(toRef(props, 'align'))
</script>

<template>
  <section
    v-if="!hidden"
    class="py-4 py-md-16"
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
        <h2
          v-if="title || $slots.title"
          class="text-h4 text-md-h3 font-weight-bold mt-0 mb-4"
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
          class="text-h6 text-md-h5 text-medium-emphasis mb-8"
        >
          <slot
            name="description"
            mdc-unwrap="p"
          >
            {{ description }}
          </slot>
        </div>
      </v-col>
    </v-row>

    <slot />
  </section>
</template>

<style scoped>
h2 {
  line-height: 1.3;
}
</style>
