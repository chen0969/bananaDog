<script setup lang="ts">
import Parent from '../../components/client/CPimg.vue';
import Cinfos from '../../components/client/CPinfos.vue';
import Subfooter from '../../components/client/CPSubfooter.vue';
</script>

<template>
  <div class="flex flex-col items-center justify-between">
    <!-- name and level -->
    <section >
      <Cinfos />
    </section>

    <!-- photo and basic info section -->
    <section class="aspect-square">
      <div class="static flex flex-col items-center justify-center w-full">
        <Parent class="fixed bottom-20" />
      </div>
    </section>

    <!-- sub footer -->
    <section class="flex flex-col justify-end items-center">
      <Subfooter />
    </section>
  </div>
</template>