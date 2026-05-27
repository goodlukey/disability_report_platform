<template>
  <div>
    <v-img
      v-if="previewUrl"
      :src="previewUrl"
      max-height="240"
      cover
      rounded="lg"
      class="mb-3"
    />
    <div class="d-flex gap-2">
      <v-btn
        prepend-icon="mdi-camera"
        variant="outlined"
        @click="triggerInput('camera')"
      >
        拍照
      </v-btn>
      <v-btn
        prepend-icon="mdi-image"
        variant="outlined"
        @click="triggerInput('gallery')"
      >
        從相簿選擇
      </v-btn>
    </div>

    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      class="d-none"
      @change="onFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ 'update:modelValue': [file: File | null] }>()

const inputRef = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)

function triggerInput(source: 'camera' | 'gallery') {
  if (!inputRef.value) return
  inputRef.value.capture = source === 'camera' ? 'environment' : ''
  inputRef.value.click()
}

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = file ? URL.createObjectURL(file) : null
  emit('update:modelValue', file)
}
</script>
