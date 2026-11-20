<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { getAuth, onAuthStateChanged, type Unsubscribe } from 'firebase/auth';
import { useDogs } from "../../composables/useDogs";
import Doggy from '../../assets/bd-dog.svg';
import NavBar from '../../components/NavBar.vue';
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerOverlay,
  DrawerPortal,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from 'reka-ui'
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
  <div v-else-if="dog" class="flex flex-col items-center justify-between w-screen gap-3 overflow-hidden">
    <div class="z-2 w-50 relative -right-20 top-15">
      <img :src="Doggy" alt="dog" class="w-full">
    </div>
    <DrawerRoot>
      <DrawerTrigger class="w-50 pt-2 reg-text-drawer z-2">
        <h1>Open Drawer</h1>
      </DrawerTrigger>
      <DrawerPortal>
        <DrawerOverlay class="DrawerOverlay fixed inset-0 z-30 bg-black/40" />
        <!-- `--bleed` is extra drawer area hanging below the viewport edge, kept
           off-screen by an equal negative margin. Pulling the drawer away from
           its edge slides the bleed into view instead of exposing the overlay,
           so the drawer stretches rather than detaching while it rubber-bands. -->
        <DrawerContent
          class="DrawerContent fixed inset-x-0 bottom-0 z-[100] mx-auto flex max-w-[500px] flex-col rounded-t-[16px] bg-white outline-none [--bleed:48px] mb-[calc(-1*var(--bleed))] pb-[calc(env(safe-area-inset-bottom,0px)+var(--bleed))]">
          <DrawerHandle class="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-mauve6" />
          <div class="p-6">
            <DrawerTitle class="text-mauve12 m-0 text-[17px] font-semibold">
              Edit profile
            </DrawerTitle>
            <DrawerDescription class="text-mauve11 mt-[10px] mb-5 text-sm leading-normal">
              Make changes to your profile here. Swipe down or click close when you're done.
            </DrawerDescription>
            <fieldset class="mb-[15px] flex items-center gap-5">
              <label class="text-grass11 w-[90px] text-right text-sm" for="name"> Name </label>
              <input id="name"
                class="text-grass11 bg-stone-50 shadow-green7 focus:shadow-green8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-lg px-[10px] text-sm leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
                value="Pedro Duarte">
            </fieldset>
            <div class="mt-[25px] flex justify-end">
              <DrawerClose as-child>
                <button
                  class="bg-green4 text-green11 text-sm hover:bg-green5 focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-lg px-[15px] font-semibold leading-none focus:shadow-[0_0_0_2px] focus:outline-none">
                  Save changes
                </button>
              </DrawerClose>
            </div>
          </div>
          <NavBar />
        </DrawerContent>
      </DrawerPortal>
    </DrawerRoot>
  </div>
  <p v-else-if="searched" class="text-gray-500">Can't find your banana dog 😭</p>
</template>

<style lang="css" scoped>
.DrawerOverlay[data-state="open"] {
  animation: drawer-overlay-in 450ms cubic-bezier(0.32, 0.72, 0, 1);
}

.DrawerOverlay[data-state="closed"] {
  animation: drawer-overlay-out 450ms cubic-bezier(0.32, 0.72, 0, 1);
}

.DrawerContent {
  /* `--drawer-swipe-movement-y` is written by DrawerContent while dragging. */
  transform: translateY(var(--drawer-swipe-movement-y, 0px));
  transition: transform 450ms cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform;
}

/* Enter/exit keyframes animate the independent `translate` property so they
   compose with the inline `transform` carrying the live drag offset. */
.DrawerContent[data-state="open"] {
  animation: drawer-slide-bottom-in 450ms cubic-bezier(0.32, 0.72, 0, 1);
}

.DrawerContent[data-state="closed"] {
  animation: drawer-slide-bottom-out 450ms cubic-bezier(0.32, 0.72, 0, 1);
}

/* Silence the transform transition during an active drag so it tracks the
   pointer in real time. */
.DrawerContent[data-swiping] {
  transition-duration: 0ms;
  user-select: none;
}

@keyframes drawer-overlay-in {
  from {
    opacity: 0;
  }
}

@keyframes drawer-overlay-out {
  to {
    opacity: 0;
  }
}

/* The bleed already sits below the viewport edge, so the drawer only has to
   travel `height - bleed` to clear it. A full 100% would overshoot by the
   bleed and make the slide look faster than it is. */
@keyframes drawer-slide-bottom-in {
  from {
    translate: 0 calc(100% - var(--bleed));
  }
}

@keyframes drawer-slide-bottom-out {
  to {
    translate: 0 calc(100% - var(--bleed));
  }
}
</style>