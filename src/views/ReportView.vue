<template>
  <v-container class="py-6" max-width="600">
    <v-card>
      <v-card-title class="text-h6 pa-4">回報無障礙設施問題</v-card-title>
      <v-card-text class="d-flex flex-column ga-4">

        <v-select
          v-model="form.line"
          :items="lineOptions"
          item-title="name"
          item-value="id"
          label="路線"
          prepend-inner-icon="mdi-train"
          variant="outlined"
          @update:model-value="form.station = ''"
        />

        <v-select
          v-model="form.station"
          :items="stationOptions"
          label="站名"
          prepend-inner-icon="mdi-map-marker-radius"
          variant="outlined"
          :disabled="!form.line"
          no-data-text="請先選擇路線"
        />

        <v-text-field
          v-model="form.locationDescription"
          label="地點說明"
          placeholder="例：M4 出口、1 號月台、電梯旁"
          prepend-inner-icon="mdi-map-marker"
          variant="outlined"
        />

        <v-textarea
          v-model="form.issueDescription"
          label="問題描述"
          placeholder="請詳細描述無障礙設施的問題..."
          prepend-inner-icon="mdi-text"
          rows="4"
          variant="outlined"
        />

        <div>
          <p class="text-subtitle-2 mb-2">上傳照片（最多三張）</p>
          <ImageUpload v-model="imageFiles" />
        </div>

        <v-btn
          color="primary"
          size="large"
          block
          :disabled="!canSubmit"
          @click="submit"
        >
          送出回報
        </v-btn>

      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ImageUpload from '../components/report/ImageUpload.vue'
import { useReportStore } from '../stores/reportStore'
import { MRT_LINES } from '../data/mrtData'

const router = useRouter()
const store = useReportStore()

const imageFiles = ref<File[]>([])

const form = ref({
  line: '',
  station: '',
  locationDescription: '',
  issueDescription: '',
})

const lineOptions = MRT_LINES.map(l => ({ id: l.id, name: l.name }))

const stationOptions = computed(() => {
  const line = MRT_LINES.find(l => l.id === form.value.line)
  return line ? line.stations.map(s => s.name) : []
})

const selectedStation = computed(() => {
  const line = MRT_LINES.find(l => l.id === form.value.line)
  return line?.stations.find(s => s.name === form.value.station) ?? null
})

const isSubmitting = ref(false)

const canSubmit = computed(() =>
  !isSubmitting.value &&
  form.value.line &&
  form.value.station &&
  form.value.locationDescription.trim() &&
  form.value.issueDescription.trim() &&
  imageFiles.value.length > 0
)

async function submit() {
  if (!canSubmit.value || !selectedStation.value) return
  
  isSubmitting.value = true
  const lineName = MRT_LINES.find(l => l.id === form.value.line)?.name ?? form.value.line

  const formData = new FormData()
  formData.append('line', lineName)
  formData.append('station', form.value.station)
  formData.append('lat', selectedStation.value.lat.toString())
  formData.append('lng', selectedStation.value.lng.toString())
  formData.append('locationDescription', form.value.locationDescription)
  formData.append('issueDescription', form.value.issueDescription)
  
  imageFiles.value.forEach((file) => {
    formData.append('images', file)
  })

  const success = await store.addReport(formData)
  
  isSubmitting.value = false
  if (success) {
    router.push('/map')
  } else {
    alert('提交失敗，請檢查後端連線')
  }
}
</script>
