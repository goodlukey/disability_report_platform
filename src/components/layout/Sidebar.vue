<template>
  <v-navigation-drawer v-model="drawerOpen" temporary>
    <v-list nav>
      <v-list-item
        prepend-icon="mdi-map"
        title="地圖檢視"
        to="/map"
        @click="drawerOpen = false"
      />
      <v-list-item
        prepend-icon="mdi-camera"
        title="回報問題"
        to="/report"
        @click="drawerOpen = false"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
const drawerOpen = defineModel<boolean>({ default: false })
</script>
