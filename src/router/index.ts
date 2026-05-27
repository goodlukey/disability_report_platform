import { createRouter, createWebHistory } from 'vue-router'
import MapView from '../views/MapView.vue'
import ReportView from '../views/ReportView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/map' },
    { path: '/map', component: MapView },
    { path: '/report', component: ReportView },
  ],
})

export default router
