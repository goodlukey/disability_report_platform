<template>
  <div>
    <div v-if="previews.length" class="d-flex flex-wrap ga-2 mb-3">
      <div v-for="(url, i) in previews" :key="i" class="position-relative">
        <v-img :src="url" width="96" height="96" cover rounded="lg" />
        <v-btn
          icon="mdi-close"
          size="x-small"
          color="error"
          class="position-absolute"
          style="top: -8px; right: -8px"
          @click="remove(i)"
        />
      </div>
    </div>

    <div v-if="previews.length < 3" class="d-flex ga-2">
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

    <p v-if="previews.length" class="text-caption text-medium-emphasis mt-1">
      已選擇 {{ previews.length }}/3 張
    </p>

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

const emit = defineEmits<{ 'update:modelValue': [files: File[]] }>()

const inputRef = ref<HTMLInputElement | null>(null)
const files = ref<File[]>([])
const previews = ref<string[]>([])

function triggerInput(source: 'camera' | 'gallery') {
  if (!inputRef.value) return
  inputRef.value.capture = source === 'camera' ? 'environment' : ''
  inputRef.value.click()
}

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null
  if (!file || files.value.length >= 3) return
  files.value.push(file)
  previews.value.push(URL.createObjectURL(file))
  emit('update:modelValue', [...files.value])
  if (inputRef.value) inputRef.value.value = ''
}

function remove(index: number) {
  URL.revokeObjectURL(previews.value[index])
  files.value.splice(index, 1)
  previews.value.splice(index, 1)
  emit('update:modelValue', [...files.value])
}
</script>
