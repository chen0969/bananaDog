<script setup lang="ts">
import { ref } from 'vue';
import Cimg from '../../components/client/CBDimg.vue';
import Cemo from '../../components/client/Cemo.vue';
import Cinfos from '../../components/client/CBDinfos.vue';
const emo = ref<InstanceType<typeof Cemo> | null>(null);

const showEmo = () => {
  emo.value?.showLike();
};

</script>

<template>
  <!-- name and level -->
  <!-- photo -->
  <section class="flex flex-col items-center justify-center w-full h-full gap-4 p-4">
    <Cinfos />
    <div class="static flex flex-col items-center justify-center w-full">
      <Cimg class="absolute" @touch="showEmo" />
      <Cemo class="absolute" ref="emo" />
    </div>
  </section>
</template>