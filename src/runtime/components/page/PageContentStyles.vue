<template>
  <div class="text-body-1">
    <slot />
  </div>
</template>

<style scoped>
/* Links */
:deep(p a), :deep(li a), :deep(td a), :deep(th a) {
  color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
  text-decoration: underline;
  text-decoration-color: rgb(var(--v-theme-secondary));
  text-underline-offset: 4px;
}
:deep(p a:hover), :deep(li a:hover), :deep(td a:hover), :deep(th a:hover) {
  color: rgb(var(--v-theme-secondary));
  text-decoration: none;
}

/* Paragraphs */
:deep(p) {
  line-height: 1.75rem;
  white-space: pre-line;
}
:deep(p):not(:last-child) {
  padding-bottom: 1rem;
}

/* Lists */
:deep(ul),
:deep(ol) {
  margin-bottom: 1rem;
  padding-left: 32px;
}
:deep(li) {
  line-height: 2rem;
  margin-bottom: 0.1rem;
}

/* Headings */
:deep(h2) {
  font-size: 1.75rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
:deep(h3) {
  font-size: 1.5rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
:deep(h4) {
  color: #616161;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
:deep(h6) {
  color: #616161;
  text-transform: uppercase;
  margin-top: 1rem;
  margin-bottom: -0.5rem;
  font-size: medium;
}

/* Blockquote */
:deep(blockquote) {
  margin-top: 1rem;
  margin-bottom: 2rem;
  padding-top: 15px;
  padding-bottom: 15px;
  padding-left: 20px;
  border-left: 6px solid rgb(var(--v-theme-secondary));
  line-height: 2rem;
  font-size: 1.1rem;
  white-space: pre-line;
}

/* Code */
:deep(pre) {
  text-wrap: auto;
  margin-bottom: 1rem;
}

/* Tables */
:deep(table) {
  display: block;
  width: max-content;
  max-width: 100%;
  overflow-x: auto;
  margin-right: auto;
  margin-left: auto;
  margin-bottom: 1.25rem;
  border-collapse: collapse;
}
:deep(th) {
  padding: 16px 8px;
  border-bottom: 1px solid #ddd;
}
:deep(td) {
  padding: 16px 8px;
  border-bottom: 1px solid #ddd;
}

/* HR */
:deep(hr) {
  width: 20%;
  margin: 2rem auto;
  border: none;
  border-top: 1px solid rgba(var(--v-theme-on-background), 0.12);
}
</style>
