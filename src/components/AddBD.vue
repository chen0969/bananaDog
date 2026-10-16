<template>
  <ToastProvider :duration="4000">
    <DialogRoot v-model:open="dialogOpen">
      <div class="my-4">
        <DialogTrigger as-child>
          <button
            class="inline-flex items-center gap-2 rounded-md border border-yellow-600 bg-yellow-300 px-4 py-2 font-bold text-gray-900 transition hover:bg-yellow-400"
          >
            Add New Banana Dog
          </button>
        </DialogTrigger>
      </div>

      <DialogPortal>
        <DialogOverlay class="fixed inset-0 z-40 bg-black/50" />
        <DialogContent
          class="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl focus:outline-none"
        >
          <div class="mb-4 flex items-start justify-between">
            <div>
              <DialogTitle class="text-lg font-semibold text-gray-900">
                Add New Banana Dog
              </DialogTitle>
              <DialogDescription class="mt-1 text-sm text-gray-500">
                Fill in the name and parent. Other fields use default values.
              </DialogDescription>
            </div>
            <DialogClose
              aria-label="Close"
              class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <span aria-hidden="true">×</span>
            </DialogClose>
          </div>

          <form class="space-y-4" @submit.prevent="postBananaDog">
            <div>
              <Label for="bdname" class="mb-1 block text-sm font-medium text-gray-700">
                Name <span class="text-red-500">*</span>
              </Label>
              <input
                id="bdname"
                v-model="form.bdname"
                type="text"
                required
                placeholder="e.g. Han solo"
                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200"
              />
            </div>

            <div>
              <Label for="bdparent" class="mb-1 block text-sm font-medium text-gray-700">
                Parent
              </Label>
              <input
                id="bdparent"
                v-model="form.bdparent"
                type="text"
                placeholder="e.g. Chubaka"
                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200"
              />
            </div>

            <p v-if="postError" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {{ postError }}
            </p>

            <div class="flex justify-end gap-2 pt-2">
              <DialogClose as-child>
                <button
                  type="button"
                  :disabled="isPosting"
                  class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </DialogClose>
              <button
                type="submit"
                :disabled="isPosting || !form.bdname.trim()"
                class="inline-flex items-center gap-2 rounded-md border border-yellow-600 bg-yellow-300 px-4 py-2 text-sm font-bold text-gray-900 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span
                  v-if="isPosting"
                  class="h-4 w-4 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"
                />
                {{ isPosting ? 'Adding...' : 'Add' }}
              </button>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>

    <!-- Success toast -->
    <ToastRoot
      v-model:open="toastOpen"
      class="flex items-start gap-3 rounded-lg border border-green-300 bg-white p-4 shadow-lg"
    >
      <div class="flex-1">
        <ToastTitle class="text-sm font-semibold text-green-700">Success</ToastTitle>
        <ToastDescription class="mt-1 text-sm text-gray-600">
          {{ toastMessage }}
        </ToastDescription>
      </div>
      <ToastClose
        aria-label="Close"
        class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
      >
        <span aria-hidden="true">×</span>
      </ToastClose>
    </ToastRoot>

    <ToastViewport
      class="fixed bottom-4 right-4 z-50 m-0 flex w-96 max-w-[calc(100vw-2rem)] list-none flex-col gap-2 p-0 outline-none"
    />
  </ToastProvider>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Label,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
} from 'reka-ui';

// Shape of the document returned by the Firestore REST API
interface FirestoreDocument {
  name: string;
  fields: Record<string, unknown>;
  createTime?: string;
  updateTime?: string;
}

// Emit an event to refresh the list in the parent after a successful post
const emit = defineEmits<{
  dogAdded: [document: FirestoreDocument];
}>();

const dialogOpen = ref<boolean>(false);
const isPosting = ref<boolean>(false);
const postError = ref<string | null>(null);

const form = reactive({
  bdname: '',
  bdparent: '',
});

// Reset the form every time the dialog closes
watch(dialogOpen, (open: boolean) => {
  if (!open) {
    form.bdname = '';
    form.bdparent = '';
    postError.value = null;
  }
});

const toastOpen = ref<boolean>(false);
const toastMessage = ref<string>('');

function showToast(message: string): void {
  toastMessage.value = message;
  // Close first so a new toast re-triggers even if one is already showing
  toastOpen.value = false;
  requestAnimationFrame(() => {
    toastOpen.value = true;
  });
}

const apiUrl =
  'https://firestore.googleapis.com/v1/projects/sharpinven/databases/(default)/documents/bana_dogs';

const postBananaDog = async (): Promise<void> => {
  if (!form.bdname.trim()) return;

  isPosting.value = true;
  postError.value = null;

  // Firestore REST requires wrapping every value in its type object.
  // Only bdname and bdparent come from the form; the rest are defaults.
  const newDogPayload = {
    fields: {
      bdname: { stringValue: form.bdname.trim() },
      bdparent: { stringValue: form.bdparent.trim() },
      bdid: { integerValue: '0' }, // Firestore REST integers must be strings
      bdlevel: { integerValue: '1' },
      bdalive: { booleanValue: true },
      bdhealthy: { booleanValue: true },
      bdpic: { stringValue: 'https://api.dicebear.com/10.x/voxel-art/svg?seed=' + form.bdparent.trim() },
      bdpick: { stringValue: '' },
      bdage: { integerValue: '1' },
      visittime: { integerValue: '1' }
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newDogPayload),
    });

    if (!response.ok) {
      const errData: { error?: { message?: string } } = await response.json();
      throw new Error(errData.error?.message || `HTTP error! Status: ${response.status}`);
    }

    const createdDocument: FirestoreDocument = await response.json();
    dialogOpen.value = false;
    showToast('Banana Dog added successfully!');

    // Trigger refresh in parent
    emit('dogAdded', createdDocument);
  } catch (err: unknown) {
    // Show the error inside the dialog so the user can fix it and retry
    postError.value = err instanceof Error ? err.message : String(err);
  } finally {
    isPosting.value = false;
  }
};
</script>