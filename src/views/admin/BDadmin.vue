<script setup lang="ts">
import BDcards from '../../components/BDcards.vue';
import BDp from '../../assets/bd-p.svg';
import AddBD from '../../components/AddBD.vue';
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div>
      <h1 class="text-3xl font-bold mb-4 text-center mt-3">Admin Dog Home</h1>
      <img :src="BDp" alt="BDp" class="w-full h-full object-cover" />
    </div>
    <BDcards />
    <div>
      <AddBD />
    </div>
  </div>
</template>