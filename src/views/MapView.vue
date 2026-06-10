<template>
  <div style="width: 100%; height: calc(100vh - 64px)">
    <div ref="mapContainer" style="width: 100%; height: 100%" />

    <v-bottom-sheet v-model="sheet" inset>
      <v-sheet>
        <div class="d-flex align-center px-4 pt-4 pb-2">
          <div>
            <div class="text-subtitle-1 font-weight-bold">{{ selectedStationName }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ selectedReports.length > 0 ? `${selectedReports.length} 則檢舉回報` : '目前尚無回報' }}
            </div>
          </div>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="sheet = false" />
        </div>
        <v-divider />
        <div class="overflow-y-auto py-2" style="max-height: 52vh">
          <v-card
            v-for="report in selectedReports"
            :key="report.id"
            flat
            border
            class="mx-3 mb-2"
          >
            <div class="d-flex">
              <div class="flex-shrink-0 position-relative" style="width: 80px; height: 80px">
                <v-img :src="report.imageUrls[0]" width="80" height="80" cover class="h-100 rounded-s" />
                <div
                  v-if="report.imageUrls.length > 1"
                  class="position-absolute text-white text-caption px-1 rounded-sm bg-black"
                  style="opacity: 0.75; bottom: 4px; right: 4px"
                >
                  +{{ report.imageUrls.length - 1 }}
                </div>
              </div>
              <div class="pa-3 flex-grow-1 overflow-hidden">
                <div class="text-body-2 font-weight-medium text-truncate">
                  {{ report.locationDescription }}
                </div>
                <div class="text-caption text-medium-emphasis issue-clamp">
                  {{ report.issueDescription }}
                </div>
                <span class="text-caption text-disabled">{{ formatDate(report.createdAt) }}</span>
              </div>
            </div>
          </v-card>
        </div>
        <v-divider />
        <div class="pa-3">
          <v-btn
            block
            color="primary"
            variant="tonal"
            prepend-icon="mdi-plus-circle-outline"
            @click="goToReport"
          >
            回報此站問題
          </v-btn>
        </div>
      </v-sheet>
    </v-bottom-sheet>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useReportStore, type Report } from '../stores/reportStore'

const store = useReportStore()
const router = useRouter()
const mapContainer = ref<HTMLElement | null>(null)
const sheet = ref(false)
const selectedReports = ref<Report[]>([])
const selectedStationName = ref('')

const API_URL = 'http://localhost:3000/api'
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

interface MrtStation { name: string; lat: number; lng: number }
interface MrtLine { id: string; name: string; stations: MrtStation[] }

const mrtLines = ref<MrtLine[]>([])
let map: google.maps.Map | null = null
const markerMap = new Map<string, google.maps.Marker>()

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

function goToReport() {
  sheet.value = false
  router.push('/report')
}

async function fetchMrtLines() {
  try {
    const res = await fetch(`${API_URL}/mrt-lines`)
    mrtLines.value = await res.json()
  } catch {
    console.error('Failed to load MRT lines')
  }
}

function findNearestStation(lat: number, lng: number) {
  const THRESHOLD = 0.003 // ~300m in degree units
  let nearest: { line: string; station: string; lat: number; lng: number } | null = null
  let minDist = THRESHOLD
  mrtLines.value.forEach(line => {
    line.stations.forEach(s => {
      const dist = Math.hypot(s.lat - lat, s.lng - lng)
      if (dist < minDist) {
        minDist = dist
        nearest = { line: line.name, station: s.name, lat: s.lat, lng: s.lng }
      }
    })
  })
  return nearest
}

function createSvgIcon(count: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="17" fill="#1565C0" stroke="white" stroke-width="2"/><text x="18" y="23" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="Arial,sans-serif">${count}</text></svg>`
}

async function initMap() {
  if (!mapContainer.value || !GOOGLE_MAPS_API_KEY) return
  await loadGoogleMapsScript()
  await Promise.all([store.fetchReports(), fetchMrtLines()])
  map = new google.maps.Map(mapContainer.value, {
    center: { lat: 25.0478, lng: 121.5319 },
    zoom: 13,
    mapId: '218c2a340c428625e411c884',
  })

  // Intercept Google Maps default POI clicks for stations without custom markers
  map.addListener('click', (event: google.maps.MapMouseEvent) => {
    const e = event as any
    if (!e.placeId) return
    e.stop()
    const latLng = e.latLng
    if (!latLng) return

    const nearest = findNearestStation(latLng.lat(), latLng.lng())
    if (!nearest) return

    // Stations with reports have a custom marker that handles clicks
    if (markerMap.has(`${nearest.line}__${nearest.station}`)) return

    map!.panTo({ lat: nearest.lat, lng: nearest.lng })
    selectedReports.value = []
    selectedStationName.value = `${nearest.line} ${nearest.station}`
    sheet.value = true
  })

  renderMarkers()
}

function clearMarkers() {
  markerMap.forEach(m => m.setMap(null))
  markerMap.clear()
}

function renderMarkers() {
  if (!map) return
  clearMarkers()

  const groups = new Map<string, { reports: Report[]; lat: number; lng: number }>()
  store.reports.forEach(report => {
    const key = `${report.line}__${report.station}`
    if (!groups.has(key)) groups.set(key, { reports: [], lat: report.lat, lng: report.lng })
    groups.get(key)!.reports.push(report)
  })

  groups.forEach(({ reports: gr, lat, lng }) => {
    const { line, station } = gr[0]
    const marker = new google.maps.Marker({
      map,
      position: { lat, lng },
      title: `${line} ${station}`,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(createSvgIcon(gr.length))}`,
        scaledSize: new google.maps.Size(36, 36),
        anchor: new google.maps.Point(18, 18),
      },
    })
    marker.addListener('click', () => {
      map!.panTo({ lat, lng })
      selectedReports.value = store.reports.filter(r => r.line === line && r.station === station)
      selectedStationName.value = `${line} ${station}`
      sheet.value = true
    })
    markerMap.set(`${line}__${station}`, marker)
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

<style scoped>
.issue-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
