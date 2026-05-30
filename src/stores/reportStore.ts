import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Report {
  id: string
  imageUrls: string[]
  line: string
  station: string
  lat: number
  lng: number
  locationDescription: string
  issueDescription: string
  createdAt: Date
}

export const useReportStore = defineStore('report', () => {
  const reports = ref<Report[]>([])
  const API_URL = 'http://localhost:3000/api'

  async function fetchReports() {
    try {
      const response = await fetch(`${API_URL}/reports`)
      const data = await response.json()
      reports.value = data
    } catch (err) {
      console.error('Failed to fetch reports:', err)
    }
  }

  async function addReport(formData: FormData) {
    try {
      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        body: formData,
      })
      const newReport = await response.json()
      reports.value.unshift(newReport)
      return true
    } catch (err) {
      console.error('Failed to add report:', err)
      return false
    }
  }

  return { reports, fetchReports, addReport }
})
