import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Report {
  id: string
  imageUrl: string
  lat: number
  lng: number
  locationDescription: string
  issueDescription: string
  createdAt: Date
}

export const useReportStore = defineStore('report', () => {
  const reports = ref<Report[]>([])

  function addReport(report: Omit<Report, 'id' | 'createdAt'>) {
    reports.value.push({
      ...report,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    })
  }

  return { reports, addReport }
})
