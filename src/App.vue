<script setup lang="ts">
import NavBar from './components/NavBar.vue';
</script>

<template>
  <header class="min-h-[5vh]">
  </header>
  <main>
    <RouterView class="h-[85vh]" />
  </main>
  <footer class="min-h-[10vh] fixed bottom-0 left-0 right-0 z-50 bg-white">
    <NavBar class="h-full" />
  </footer>
</template>

<style lang="css" scoped>
footer {
  background-color: var(--color-box-mark);
}
</style>