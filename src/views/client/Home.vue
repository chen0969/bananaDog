<script setup lang="ts">
import BDcards from '../../components/BDcards.vue';
import BDp from '../../assets/bd-p.svg';
import AddBD from '../../components/AddBD.vue';
</script>

<template>
  <h1>home</h1>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div>
      <h1 class="text-3xl font-bold mb-4 text-center mt-3">Banana Dog Home</h1>
      <img :src="BDp" alt="BDp" class="w-full h-full object-cover" />
    </div>
    <BDcards />
    <div>
      <AddBD />
    </div>
  </div>
</template>