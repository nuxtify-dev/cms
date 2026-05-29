<script setup lang="ts">
export interface SplitListItem {
  title: string
  description: string
}

defineProps<{
  items: SplitListItem[]
}>()
</script>

<template>
  <div class="pt-4 pt-md-10">
    <template
      v-for="(item, index) in items"
      :key="index"
    >
      <v-divider v-if="index > 0" />
      <v-row class="py-4 py-md-10 my-0">
        <v-col
          cols="12"
          md="4"
        >
          <h3 class="text-h6 text-md-h5 my-0">
            <MDC
              :value="item.title"
              unwrap="p"
              tag="span"
            />
          </h3>
        </v-col>

        <v-col
          cols="12"
          md="8"
        >
          <div class="text-body-1 text-medium-emphasis">
            <MDC :value="item.description" />
          </div>
        </v-col>
      </v-row>
    </template>
  </div>
</template>
