import { computed, type Ref } from '#imports'

export function useAlignment(align: Ref<'left' | 'center' | 'right' | undefined>) {
  const justify = computed(() => {
    switch (align.value) {
      case 'left': return 'start'
      case 'right': return 'end'
      default: return 'center'
    }
  })

  const textAlign = computed(() => {
    switch (align.value) {
      case 'left': return 'text-left'
      case 'right': return 'text-right'
      default: return 'text-center'
    }
  })

  return {
    justify,
    textAlign,
  }
}
