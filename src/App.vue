<template>
  <v-app>
    <Topbar @toggle-drawer="drawerOpen = !drawerOpen" />
    <Sidebar v-model="drawerOpen" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Topbar from './components/layout/Topbar.vue'
import Sidebar from './components/layout/Sidebar.vue'

const drawerOpen = ref(false)
</script>
