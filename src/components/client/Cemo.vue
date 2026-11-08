<script lang="ts" setup>
import { ref, onUnmounted } from "vue";

// Load every .svg in the emo folder at build time (like.svg, happy.svg, sad.svg, ...).
// Add a new svg to the folder and it is picked up automatically.
const emoModules = import.meta.glob<string>("../../assets/dogDeco/emo/*.svg", {
    eager: true,
    query: "?url",
    import: "default",
});
const emos: string[] = Object.values(emoModules);

const isActive = ref(false);
const currentSvg = ref("");
let timer: ReturnType<typeof setTimeout> | null = null;
let lastIndex = -1;

// Random svg, never the same one twice in a row
function pickRandom(): string {
    if (emos.length === 0) return "";

    let i: number;
    if (emos.length === 1 || lastIndex === -1) {
        i = Math.floor(Math.random() * emos.length);
    } else {
        i = Math.floor(Math.random() * (emos.length - 1));
        if (i >= lastIndex) i++; // skip the one we just showed
    }
    lastIndex = i;
    return emos[i];
}

// ms = how long the emoji stays on screen
const showLike = (ms = 500) => {
    const svg = pickRandom();
    if (!svg) return; // no svg files found

    // Clicking again while it is showing restarts the timer
    if (timer) clearTimeout(timer);
    currentSvg.value = svg;
    isActive.value = true;
    timer = setTimeout(() => {
        isActive.value = false;
        timer = null;
    }, ms);
};

onUnmounted(() => {
    if (timer) clearTimeout(timer);
});

// <script setup> components are closed by default.
// Without this line, the parent's emo.value.showLike() does not exist.
defineExpose({ showLike });
</script>

<template>
    <!-- Always-present overlay: invisible and never blocks clicks -->
        <!-- v-if is on the img itself, so the Transition can animate it in and out -->
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="scale-50 opacity-0"
            enter-to-class="scale-100 opacity-100" leave-active-class="transition duration-300"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <img v-if="isActive" :src="currentSvg" alt="Emoji" class="absolute" />
        </Transition>
</template>