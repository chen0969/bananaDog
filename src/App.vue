<script setup lang="ts">
import NavBar from './components/NavBar.vue';
</script>

<template>
  <main class="min-h-screen pb-16">
    <RouterView />
  </main>

  <NavBar />
</template>