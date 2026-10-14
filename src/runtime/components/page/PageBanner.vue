<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>

<template>
  <section class="page-banner bg-primary text-center my-4 my-md-0">
    <v-row
      justify="center"
      class="mx-2 py-4 py-md-16"
    >
      <v-col
        cols="12"
        md="10"
        lg="8"
        xl="4"
      >
        <div class="text-h6 text-white">
          <slot>
            {{ text }}
          </slot>
        </div>
      </v-col>
    </v-row>
  </section>
</template>

<style scoped>
.page-banner {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}
</style>
