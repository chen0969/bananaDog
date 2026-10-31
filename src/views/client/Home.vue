<script setup lang="ts">
import BDp from '../../assets/bd-p.svg';
import ClientDog from '../../components/client/CBDcard.vue';

</script>

<template>
  <div class="flex flex-col items-center justify-center p-2 gap-2">
    <h1 class="text-3xl font-bold text-center">Should be my personal dog</h1>
    <img :src="BDp" alt="BDp" class="w-50" />
    <ClientDog />
  </div>
</template>