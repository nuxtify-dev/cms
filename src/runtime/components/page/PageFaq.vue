<script setup lang="ts">
import type { VExpansionPanels } from 'vuetify/components'
import {
  useSchemaOrg,
  defineQuestion,
} from '#imports'

interface FaqItem {
  question: string
  answer: string
}

const props = defineProps<{
  questions?: FaqItem[]
  variant?: VExpansionPanels['$props']['variant']
}>()

if (props.questions) {
  useSchemaOrg([
    {
      '@type': 'FAQPage',
      'mainEntity': props.questions.map(item => (
        defineQuestion({
          name: item.question,
          acceptedAnswer: item.answer,
        })),
      ),
    },
  ])
}
</script>

<template>
  <div v-if="questions?.length">
    <v-expansion-panels
      :variant="variant || 'default'"
      multiple
      flat
      tile
      eager
    >
      <v-expansion-panel
        v-for="(item, index) in questions"
        :key="index"
        min-height="70"
        class="mt-4 faq-card"
      >
        <v-expansion-panel-title class="text-h6 py-4">
          <div class="pr-2">
            <MDC
              :value="item.question"
              unwrap="p"
            />
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text class="text-body-1">
          <MDC :value="item.answer" />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<style scoped>
/* Override border */
.faq-card {
  border: 2px solid currentColor !important;
}

/* Increase line-height for questions */
.v-expansion-panel-title {
  line-height: 1.75rem;
}

/* Question hover */
button:hover {
  color: rgb(var(--v-theme-secondary));
}
.faq-card:hover {
  border-color: rgb(var(--v-theme-secondary));
}
</style>
