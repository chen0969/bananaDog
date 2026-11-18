<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

// 目前所在的路由資訊(route.name 就是 router/index.ts 裡每個路由的 name)
const route = useRoute();

import NavBar from './components/NavBar.vue';
import Floor from './assets/dogDeco/floor.svg'

// 投影片的順序,要和導覽列的順序一致
// 這裡的名字必須和 index.ts 裡的 name 完全相同
const order = ["home", "room", "login", "news"];

// 滑動方向
// true  = 往後(前往下一頁):新頁面從右邊滑進來,舊頁面往左滑出去
// false = 往前(回到上一頁):新頁面從左邊滑進來,舊頁面往右滑出去
const forward = ref(true);

// 每次路由改變時,比較「新頁面」和「舊頁面」在 order 裡的位置
// 新頁面的位置比較後面 = 往後;反之 = 往前
watch(
  () => route.name,
  (to, from) => {
    const oldIndex = order.indexOf(from as string);
    const newIndex = order.indexOf(to as string);

    // 如果其中一個頁面不在 order 裡(例如 admin),就維持原本的方向
    if (oldIndex !== -1 && newIndex !== -1) {
      forward.value = newIndex > oldIndex;
    }
  },
);
</script>

<template>
  <header class="min-h-[5vh]">
  </header>
  <!-- overflow-x-hidden:頁面滑動時超出畫面的部分隱藏,避免出現橫向捲軸 -->
  <div class="overflow-x-hidden">
    <!-- RouterView 會把「目前路由對應的頁面元件」交給 Component -->
    <RouterView v-slot="{ Component }" class="h-[85vh]">
      <!--
        Transition:Vue 內建的轉場元件,頁面換掉時會自動套用下面的 class

        mode="out-in":先讓舊頁面滑出去,再讓新頁面滑進來(一次只顯示一頁)

        enter-active-class:新頁面進場「整個過程」的設定
          transition      = 開啟動畫效果
          duration-300    = 動畫時間 300 毫秒(想快一點改 200,慢一點改 500)
          ease-out        = 一開始快、結尾慢

        enter-from-class:新頁面「開始進場時」的起點位置
          translate-x-full  = 在畫面右邊一整個寬度之外
          -translate-x-full = 在畫面左邊一整個寬度之外

        leave-active-class:舊頁面離場「整個過程」的設定

        leave-to-class:舊頁面離場的「終點位置」
      -->
      <Transition mode="out-in" enter-active-class="transition duration-300 ease-out"
        leave-active-class="transition duration-200 ease-in"
        :enter-from-class="forward ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0'"
        :leave-to-class="forward ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'">
        <!--
          component :is="Component":顯示目前路由對應的頁面
          :key="route.path":網址改變時,Vue 會把它當成「新的元素」,轉場才會觸發
          注意:每個頁面元件的 template 最外層只能有一個根元素,否則不會有動畫
        -->
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </div>

  <!-- <NavBar /> -->
  <footer class="min-h-[10vh] fixed bottom-0 left-0 right-0 -z-1 bg-white">
    <img :src="Floor" alt="floor" class="w-full" />
    <NavBar class="h-full" />
  </footer>
</template>

<style lang="css" scoped>
footer {
  background-color: var(--color-box-mark);
}
</style>