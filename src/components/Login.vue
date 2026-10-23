<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3">
      <!-- Waiting for Firebase to restore the session -->
      <span v-if="!authReady" class="text-sm text-gray-400">Checking sign-in...</span>

      <!-- Signed in -->
      <template v-else-if="user">
        <span class="text-sm text-gray-600">
          Signed in as <span class="font-semibold text-gray-900">{{ user.email }}</span>
        </span>
        <button
          class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          @click="logout"
        >
          Sign out
        </button>
      </template>

      <!-- Signed out -->
      <DialogRoot v-else v-model:open="dialogOpen">
        <DialogTrigger as-child>
          <button
            class="rounded-md border border-yellow-600 bg-yellow-300 px-4 py-1.5 text-sm font-bold text-gray-900 transition hover:bg-yellow-400"
          >
            Sign in
          </button>
        </DialogTrigger>

        <DialogPortal>
          <DialogOverlay class="fixed inset-0 z-40 bg-black/50" />
          <DialogContent
            class="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl focus:outline-none"
          >
            <div class="mb-4 flex items-start justify-between">
              <div>
                <DialogTitle class="text-lg font-semibold text-gray-900">Sign in</DialogTitle>
                <DialogDescription class="mt-1 text-sm text-gray-500">
                  Use your tester account to add and edit dogs.
                </DialogDescription>
              </div>
              <DialogClose
                aria-label="Close"
                class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <span aria-hidden="true">×</span>
              </DialogClose>
            </div>

            <form class="space-y-4" @submit.prevent="login">
              <div>
                <Label for="login-email" class="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </Label>
                <input
                  id="login-email"
                  v-model="form.email"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="you@example.com"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                />
              </div>

              <div>
                <Label for="login-password" class="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </Label>
                <input
                  id="login-password"
                  v-model="form.password"
                  type="password"
                  required
                  autocomplete="current-password"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200"
                />
              </div>

              <p v-if="loginError" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {{ loginError }}
              </p>

              <div class="flex justify-end gap-2 pt-2">
                <DialogClose as-child>
                  <button
                    type="button"
                    :disabled="isLoggingIn"
                    class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </DialogClose>
                <button
                  type="submit"
                  :disabled="isLoggingIn || !form.email || !form.password"
                  class="inline-flex items-center gap-2 rounded-md border border-yellow-600 bg-yellow-300 px-4 py-2 text-sm font-bold text-gray-900 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span
                    v-if="isLoggingIn"
                    class="h-4 w-4 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"
                  />
                  {{ isLoggingIn ? 'Signing in...' : 'Sign in' }}
                </button>
              </div>
            </form>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>
    </div>

    <!-- Debug panel: shows the details of the login token -->
    <CollapsibleRoot
      v-if="SHOW_DEBUG && user"
      v-model:open="debugOpen"
      class="w-full max-w-xl rounded-lg border border-gray-200 bg-white text-sm"
    >
      <CollapsibleTrigger
        class="flex w-full items-center justify-between px-4 py-2 font-medium text-gray-800 hover:bg-gray-50"
      >
        <span>Token details (debug)</span>
        <span aria-hidden="true">{{ debugOpen ? '−' : '+' }}</span>
      </CollapsibleTrigger>

      <CollapsibleContent class="border-t border-gray-200 px-4 py-3">
        <p v-if="tokenError" class="rounded-md bg-red-50 px-3 py-2 text-red-700">
          Could not read the token: {{ tokenError }}
        </p>
        <p v-else-if="!tokenInfo" class="text-gray-500">Loading token...</p>

        <template v-else>
          <p class="mb-3 rounded-md bg-green-50 px-3 py-2 font-medium text-green-700">
            Login works. Firebase issued a valid ID token.
          </p>

          <dl class="divide-y divide-gray-100">
            <div class="flex justify-between gap-4 py-1.5">
              <dt class="text-gray-500">Email</dt>
              <dd class="break-all text-right font-medium">{{ tokenInfo.email }}</dd>
            </div>
            <div class="flex justify-between gap-4 py-1.5">
              <dt class="text-gray-500">UID</dt>
              <dd class="break-all text-right font-mono text-xs">{{ tokenInfo.uid }}</dd>
            </div>
            <div class="flex justify-between gap-4 py-1.5">
              <dt class="text-gray-500">Sign-in provider</dt>
              <dd class="font-medium">{{ tokenInfo.provider }}</dd>
            </div>
            <div class="flex justify-between gap-4 py-1.5">
              <dt class="text-gray-500">email_verified (in token)</dt>
              <dd
                class="font-semibold"
                :class="tokenInfo.emailVerified ? 'text-green-700' : 'text-orange-700'"
              >
                {{ tokenInfo.emailVerified }}
              </dd>
            </div>
            <div class="flex justify-between gap-4 py-1.5">
              <dt class="text-gray-500">Issued at</dt>
              <dd class="font-medium">{{ formatTime(tokenInfo.issuedAt) }}</dd>
            </div>
            <div class="flex justify-between gap-4 py-1.5">
              <dt class="text-gray-500">Expires at</dt>
              <dd class="font-medium">{{ formatTime(tokenInfo.expiresAt) }}</dd>
            </div>
            <div class="py-1.5">
              <dt class="mb-1 text-gray-500">ID token (preview)</dt>
              <dd class="break-all rounded bg-gray-50 px-2 py-1 font-mono text-xs">
                {{ tokenPreview }}
              </dd>
            </div>
          </dl>

          <p
            v-if="!tokenInfo.emailVerified"
            class="mt-3 rounded-md bg-orange-50 px-3 py-2 text-orange-800"
          >
            This email is not verified. If your Firestore rules require
            <code class="font-mono">email_verified == true</code>, every write will be rejected.
          </p>

          <div class="mt-3 flex gap-2">
            <button
              class="rounded-md border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-50"
              @click="copyToken"
            >
              {{ copied ? 'Copied!' : 'Copy token' }}
            </button>
            <button
              class="rounded-md border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-50"
              @click="refreshToken"
            >
              Refresh token
            </button>
          </div>

          <p class="mt-3 text-xs text-gray-400">
            The token is a temporary password for your account. Don't share it or post it publicly.
          </p>
        </template>
      </CollapsibleContent>
    </CollapsibleRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
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
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
} from 'reka-ui';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from '../firebase';

// Show the token debug panel and console logs. Set to false before sharing the site.
const SHOW_DEBUG = true;

interface TokenInfo {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  provider: string | null;
  issuedAt: string;
  expiresAt: string;
  token: string;
}

const user = ref<User | null>(null);
const authReady = ref<boolean>(false);

const dialogOpen = ref<boolean>(false);
const isLoggingIn = ref<boolean>(false);
const loginError = ref<string | null>(null);

const debugOpen = ref<boolean>(true);
const tokenInfo = ref<TokenInfo | null>(null);
const tokenError = ref<string | null>(null);
const copied = ref<boolean>(false);

const form = reactive({
  email: '',
  password: '',
});

const tokenPreview = computed<string>(() => {
  const t = tokenInfo.value?.token ?? '';
  return t.length > 40 ? `${t.slice(0, 24)} ... ${t.slice(-12)}` : t;
});

function formatTime(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

// Read the ID token and its details (this is what Firestore rules see)
async function loadTokenInfo(u: User, forceRefresh = false): Promise<void> {
  tokenError.value = null;
  try {
    const r = await u.getIdTokenResult(forceRefresh);
    tokenInfo.value = {
      uid: u.uid,
      email: u.email,
      emailVerified: r.claims.email_verified === true,
      provider: r.signInProvider,
      issuedAt: r.issuedAtTime,
      expiresAt: r.expirationTime,
      token: r.token,
    };
    if (SHOW_DEBUG) {
      console.log('[Login] signed in. Token details:', {
        ...tokenInfo.value,
        token: `${r.token.slice(0, 24)}... (${r.token.length} chars)`,
        claims: r.claims,
      });
    }
  } catch (err: unknown) {
    tokenInfo.value = null;
    tokenError.value = err instanceof Error ? err.message : String(err);
    console.error('[Login] could not read the token:', err);
  }
}

// Firebase keeps the session after a page refresh; this restores it
// and keeps `user` in sync with sign-in / sign-out.
let unsubscribe: Unsubscribe | null = null;

onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, (u) => {
    user.value = u;
    authReady.value = true;
    if (u) {
      void loadTokenInfo(u);
    } else {
      tokenInfo.value = null;
      tokenError.value = null;
      if (SHOW_DEBUG) console.log('[Login] signed out');
    }
  });
});

onUnmounted(() => {
  unsubscribe?.();
});

// Reset the form every time the dialog closes
watch(dialogOpen, (open: boolean) => {
  if (!open) {
    form.email = '';
    form.password = '';
    loginError.value = null;
  }
});

function friendlyError(err: unknown): string {
  const code = (err as { code?: string }).code;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Wrong email or password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in the Firebase console.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return err instanceof Error ? err.message : String(err);
  }
}

async function login(): Promise<void> {
  isLoggingIn.value = true;
  loginError.value = null;

  try {
    await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
    dialogOpen.value = false;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    console.error('[Login] sign-in failed:', code, err);
    loginError.value = friendlyError(err);
  } finally {
    isLoggingIn.value = false;
  }
}

async function logout(): Promise<void> {
  await signOut(auth);
}

async function refreshToken(): Promise<void> {
  if (user.value) await loadTokenInfo(user.value, true);
}

async function copyToken(): Promise<void> {
  if (!tokenInfo.value) return;
  try {
    await navigator.clipboard.writeText(tokenInfo.value.token);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1500);
  } catch (err: unknown) {
    console.error('[Login] could not copy the token:', err);
  }
}
</script>