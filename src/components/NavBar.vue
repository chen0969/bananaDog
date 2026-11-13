<script setup lang="ts">
import { Banana, DoorOpen, Newspaper, Settings, Key } from 'lucide-vue-next'
</script>

<template>
  <nav class="flex flex-row items-center justify-around p-1 pt-2">
    <!-- home -->
    <RouterLink to="/" class="routerLink flex h-full flex-1 flex-col items-center justify-center gap-1"
      active-class="text-blue-600">
      <Banana :size="22" />
      <span class="text-xs">Home</span>
    </RouterLink>

    <!-- room -->
    <RouterLink to="/CRoom" class="routerLink flex h-full flex-1 flex-col items-center justify-center gap-1"
      active-class="text-blue-600">
      <DoorOpen :size="22" />
      <span class="text-xs">MyRoom</span>
    </RouterLink>

    <!-- setting -->
    <RouterLink to="/Admin" class="routerLink flex h-full flex-1 flex-col items-center justify-center gap-1"
      active-class="text-blue-600">
      <Settings :size="22" />
      <span class="text-xs">Admin</span>
    </RouterLink>

    <!-- login -->
    <RouterLink to="/Login" class="routerLink flex h-full flex-1 flex-col items-center justify-center gap-1"
      active-class="text-blue-600">
      <Key :size="22" />
      <span class="text-xs">Login</span>
    </RouterLink>

    <!-- news -->
    <RouterLink to="/CNews" class="routerLink flex h-full flex-1 flex-col items-center justify-center gap-1"
      active-class="text-blue-600">
      <Newspaper :size="22" />
      <span class="text-xs">News</span>
    </RouterLink>
  </nav>
</template>

<style lang="css" scoped>

.routerLink {
  color: var(--color-bd-body);
  text-decoration: none;
}
</style>