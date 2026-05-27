<template>
  <v-app-bar color="primary" elevation="2">
    <v-app-bar-nav-icon @click="emit('toggle-drawer')" />
    <v-app-bar-title>有沒有障礙</v-app-bar-title>
  </v-app-bar>
</template>

<script setup lang="ts">
const emit = defineEmits<{ 'toggle-drawer': [] }>()
</script>
