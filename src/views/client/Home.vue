<script setup lang="ts">
import { ref } from 'vue';
import Cimg from '../../components/client/CBDimg.vue';
import Cemo from '../../components/client/Cemo.vue';
import Cinfos from '../../components/client/CBDinfos.vue';
import Subfooter from '../../components/Subfooter.vue';
const emo = ref<InstanceType<typeof Cemo> | null>(null);

const showEmo = () => {
  emo.value?.showLike();
};

</script>

<template>
  <div class="flex flex-col items-center justify-between">
    <!-- name and level -->
    <section>
      <Cinfos  />
    </section>

    <!-- photo and basic info section -->
    <section class="aspect-square">
      <div class="static flex flex-col items-center justify-center w-full">
        <Cimg class="absolute" @touch="showEmo" />
        <Cemo class="absolute" ref="emo" />
      </div>
    </section>

    <!-- sub footer -->
    <section class="flex flex-col justify-end items-center">
      <Subfooter />
    </section>
  </div>
</template>