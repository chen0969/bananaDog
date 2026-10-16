<script setup lang="ts">
import { onMounted } from "vue";
import {
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
  Separator,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  TooltipArrow,
} from "reka-ui";
import { useDogs } from "../composables/useDogs";
import Dogimg from "../assets/bd-dog.svg";

const { dogs, loading, error, fetchDogs } = useDogs();

// One-time load. Swap in subscribeDogs for live updates.
onMounted(fetchDogs);
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <section class="mx-auto max-w-6xl px-4 py-6">
      <header class="mb-5 flex items-center justify-between">
        <h2 class="text-2xl font-semibold">
          Dogs
          <span v-if="dogs.length" class="font-normal text-gray-500">({{ dogs.length }})</span>
        </h2>
        <button
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
          :disabled="loading"
          @click="fetchDogs"
        >
          {{ loading ? "Loading..." : "Refresh" }}
        </button>
      </header>

      <p v-if="error" class="text-red-600">{{ error }}</p>
      <p v-else-if="loading && !dogs.length" class="text-gray-500">Loading dogs...</p>
      <p v-else-if="!dogs.length" class="text-gray-500">No dogs found.</p>

      <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="dog in dogs"
          :key="dog.id"
          class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <!-- Picture -->
          <div class="relative">
            <AvatarRoot class="block aspect-square w-full overflow-hidden bg-gray-100">
              <span>
                <img :src="Dogimg" alt="Dog" class="bdAvatar h-25 w-25 bg-amber-50" />
              </span>
              <AvatarImage
                :src="dog.bdpic"
                :alt="dog.bdname"
                class="h-full w-full object-cover"
                :class="{ grayscale: !dog.bdalive }"
              />
              <AvatarFallback
                class="flex h-full w-full items-center justify-center text-6xl font-semibold text-indigo-600"
              >
                {{ dog.bdname?.charAt(0)?.toUpperCase() || "?" }}
              </AvatarFallback>
            </AvatarRoot>
            <span
              class="absolute right-3 top-3 rounded-full bg-gray-900/80 px-3 py-1 text-xs font-semibold text-white"
            >
              Lv {{ dog.bdlevel }}
            </span>
          </div>

          <div class="p-4">
            <h3 class="mb-2 text-xl font-semibold">{{ dog.bdname }}</h3>

            <!-- Status badges -->
            <div class="mb-3 flex gap-2">
              <span
                class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                :class="dog.bdalive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ dog.bdalive ? "Alive" : "Dead" }}
              </span>
              <span
                class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                :class="dog.bdhealthy ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
              >
                {{ dog.bdhealthy ? "Healthy" : "Unhealthy" }}
              </span>
            </div>

            <!-- Details -->
            <dl class="text-sm">
              <template
                v-for="(row, i) in [
                  { label: 'Dog ID', value: dog.bdid },
                  { label: 'Level', value: dog.bdlevel },
                  { label: 'Parent', value: dog.bdparent || '-' },
                  { label: 'Alive', value: dog.bdalive ? 'Yes' : 'No' },
                  { label: 'Healthy', value: dog.bdhealthy ? 'Yes' : 'No' },
                  { label: 'Age', value: dog.bdage },
                  { label: 'Visit Time', value: dog.visittime },
                ]"
                :key="row.label"
              >
                <Separator v-if="i > 0" class="h-px bg-gray-100" />
                <div class="flex justify-between py-1.5">
                  <dt class="text-gray-500">{{ row.label }}</dt>
                  <dd class="font-medium">{{ row.value }}</dd>
                </div>
              </template>
            </dl>

            <p class="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span class="font-semibold">Pick:</span> {{ dog.bdpick || "-" }}
            </p>

            <!-- Firestore document ID, full value on hover -->
            <TooltipRoot>
              <TooltipTrigger as-child>
                <p class="mt-2 cursor-default truncate text-[11px] text-gray-400">Doc: {{ dog.id }}</p>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent
                  side="top"
                  :side-offset="6"
                  class="z-50 rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-md data-[state=delayed-open]:animate-pulse"
                >
                  {{ dog.id }}
                  <TooltipArrow class="fill-gray-900" />
                </TooltipContent>
              </TooltipPortal>
            </TooltipRoot>
          </div>
        </article>
      </div>
    </section>
  </TooltipProvider>
</template>

<style lang="css" scoped>
.bdAvatar {
  position: absolute;
  bottom: 10%;
  right: 10%;
  border-radius: 50%;
  object-fit: cover;
}
</style>