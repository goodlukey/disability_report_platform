<template>
  <div style="width: 100%; height: calc(100vh - 64px)">
    <!-- Google Maps will mount here once API key is configured -->
    <div ref="mapContainer" style="width: 100%; height: 100%" />

    <!-- Marker detail popup -->
    <v-dialog v-model="dialog" max-width="400">
      <v-card v-if="selected">
        <v-img :src="selected.imageUrls[0]" height="200" cover />
        <v-card-title>{{ selected.locationDescription }}</v-card-title>
        <v-card-text>{{ selected.issueDescription }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog = false">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useReportStore, type Report } from '../stores/reportStore'

const store = useReportStore()
const mapContainer = ref<HTMLElement | null>(null)
const dialog = ref(false)
const selected = ref<Report | null>(null)

// Placeholder: replace GOOGLE_MAPS_API_KEY with your actual key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

let map: google.maps.Map | null = null
const markerMap = new Map<string, google.maps.Marker>()

async function initMap() {
  if (!mapContainer.value || !GOOGLE_MAPS_API_KEY) return

  await loadGoogleMapsScript()
  await store.fetchReports() // Fetch data from backend

  map = new google.maps.Map(mapContainer.value, {
    center: { lat: 25.0478, lng: 121.5319 }, // Taipei
    zoom: 13,
    mapId: "218c2a340c428625e411c884",
  })

  renderMarkers()
}

function renderMarkers() {
  if (!map) return
  store.reports.forEach((report) => {
    if (markerMap.has(report.id)) return
    const marker = new google.maps.Marker({
      map,
      position: { lat: report.lat, lng: report.lng },
      title: report.locationDescription,
    })
    marker.addListener('click', () => {
      selected.value = report
      dialog.value = true
    })
    markerMap.set(report.id, marker)
  })
}

function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.google?.maps) { resolve(); return }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}

onMounted(initMap)
watch(() => store.reports.length, renderMarkers)
</script>
