<script setup lang="ts">
import { Home, DoorOpen, Newspaper, Settings, Key} from 'lucide-vue-next'
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 border-t bg-white">
    <div class="mx-auto flex h-16 max-w-md items-center justify-around">

      <!-- home -->
      <RouterLink to="/" class="flex h-full flex-1 flex-col items-center justify-center gap-1 text-gray-500"
        active-class="text-blue-600">
        <Home :size="22" />
        <span class="text-xs">Home</span>
      </RouterLink>

      <!-- room -->
      <RouterLink to="/CRoom" class="flex h-full flex-1 flex-col items-center justify-center gap-1 text-gray-500"
        active-class="text-blue-600">
        <DoorOpen :size="22" />
        <span class="text-xs">MyRoom</span>
      </RouterLink>

      <!-- setting -->
      <RouterLink to="/Admin" class="flex h-full flex-1 flex-col items-center justify-center gap-1 text-gray-500"
        active-class="text-blue-600">
        <Settings :size="22" />
        <span class="text-xs">Admin</span>
      </RouterLink>

      <!-- login -->
      <RouterLink to="/Login" class="flex h-full flex-1 flex-col items-center justify-center gap-1 text-gray-500"
        active-class="text-blue-600">
        <Key :size="22" />
        <span class="text-xs">Login</span>
      </RouterLink>

      <!-- news -->
      <RouterLink to="/CNews" class="flex h-full flex-1 flex-col items-center justify-center gap-1 text-gray-500"
        active-class="text-blue-600">
        <Newspaper :size="22" />
        <span class="text-xs">News</span>
      </RouterLink>

    </div>
  </nav>
</template>