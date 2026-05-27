<template>
  <v-container class="py-6" max-width="600">
    <v-card>
      <v-card-title class="text-h6 pa-4">回報無障礙設施問題</v-card-title>
      <v-card-text class="d-flex flex-column ga-4">

        <div>
          <p class="text-subtitle-2 mb-2">上傳照片</p>
          <ImageUpload v-model="imageFile" />
        </div>

        <v-btn
          prepend-icon="mdi-crosshairs-gps"
          :loading="locating"
          @click="fetchLocation"
        >
          自動取得座標
        </v-btn>

        <div v-if="form.lat && form.lng" class="text-caption text-medium-emphasis">
          緯度：{{ form.lat.toFixed(6) }}，經度：{{ form.lng.toFixed(6) }}
        </div>

        <v-text-field
          v-model="form.locationDescription"
          label="地點說明"
          placeholder="例：台北車站 M4 出口"
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

const router = useRouter()
const store = useReportStore()

const imageFile = ref<File | null>(null)
const locating = ref(false)

const form = ref({
  lat: null as number | null,
  lng: null as number | null,
  locationDescription: '',
  issueDescription: '',
})

const canSubmit = computed(() =>
  imageFile.value &&
  form.value.lat !== null &&
  form.value.locationDescription.trim() &&
  form.value.issueDescription.trim()
)

function fetchLocation() {
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.value.lat = pos.coords.latitude
      form.value.lng = pos.coords.longitude
      locating.value = false
    },
    () => { locating.value = false }
  )
}

function submit() {
  if (!canSubmit.value) return
  store.addReport({
    imageUrl: URL.createObjectURL(imageFile.value!),
    lat: form.value.lat!,
    lng: form.value.lng!,
    locationDescription: form.value.locationDescription,
    issueDescription: form.value.issueDescription,
  })
  router.push('/map')
}
</script>
