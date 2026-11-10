<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { getAuth, onAuthStateChanged, type Unsubscribe } from 'firebase/auth';
import { useDogs } from "../composables/useDogs";
import Floor from '../assets/dogDeco/floor.svg';
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
  <h3 v-if="!userEmail" class="text-gray-500">Login to see floor info!</h3>
  <p v-if="error" class="text-red-600">{{ error }}</p>
  <p v-else-if="loading" class="text-gray-500">Loading...</p>
  <!-- if data okay -->
  <div v-else-if="dog" class="flex flex-col items-center justify-between w-screen">
    <h3>Tap to see details</h3>
    <img class="w-full" :src="Floor" alt="Floor" />
  </div>
  <p v-else-if="searched" class="text-gray-500">Can't find your banana dog 😭</p>
</template>