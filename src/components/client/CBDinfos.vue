<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { ChessPawn } from 'lucide-vue-next';
import { getAuth, onAuthStateChanged, type Unsubscribe } from 'firebase/auth';
import { useDogs } from "../../composables/useDogs";
import BDava from '../../assets/dogDeco/ui/avatar.svg'
const { dog, loading, error, fetchDogByEmail } = useDogs();
const searched = ref(false);

const userEmail = ref<string | null>(null);
let unsubscribe: Unsubscribe;

// #region click
const emit = defineEmits<{ touch: [] }>();

// #endregion

onMounted(() => {
  const auth = getAuth();

  // 1. 監聽登入狀態
  unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user && user.email) {
      userEmail.value = user.email;

      // 2. 取得 email 後「自動」觸發查詢
      await fetchDogByEmail(user.email);
      searched.value = true;
    } else {
      userEmail.value = null;
      dog.value = null; // 確保登出時清空資料
    }
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<template>
  <h3 v-if="!userEmail" class="text-gray-500">Login to see your dog level!</h3>
  <p v-if="error" class="text-red-600">{{ error }}</p>
  <p v-else-if="loading" class="text-gray-500">Loading...</p>
  <!-- if data okay -->
  <div v-else-if="dog" class="flex flex-row w-screen items-center justify-between pr-2 pl-2">
    <div class="basis-lg flex flex-row items-center max-w-35">
      <span class="basis-3xs z-1"><img class="w-full" :src="BDava" alt="BDava" /></span>
      <h2 class="relative basis-md reg-text-box text-end p-1 pr-3 right-3 z-0">{{
        dog.bdname }}</h2>
    </div>
    <div>
      <h2 class="text-end reg-text-box p-1 flex flex-row items-center"> <ChessPawn :size="15" />{{ dog.bdlevel }}</h2>
    </div>
    <!-- <p>Level: {{ dog.bdlevel }} · Age {{ dog.bdage }} · Visit {{ dog.visittime }}</p> -->
  </div>
  <p v-else-if="searched" class="text-gray-500">Can't find your banana dog 😭</p>
</template>