<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import {
  DialogRoot,
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
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

// Show the token debug panel and console logs. Set to false before sharing the site.
const SHOW_DEBUG = true;

// The dialog has three "modes". We reuse ONE dialog and just change what it shows.
type Mode = 'login' | 'register' | 'reset';

// Texts for each mode (title, button label, etc.)
const TEXT = {
  login: {
    title: 'Sign in',
    button: 'Sign in',
    loading: 'Signing in...',
    description: 'Sign in with your email and password.',
  },
  register: {
    title: 'Create account',
    button: 'Create account',
    loading: 'Creating...',
    description: 'Create a new account for you and your dog.',
  },
  reset: {
    title: 'Reset password',
    button: 'Send reset link',
    loading: 'Sending...',
    description: 'We will email you a link to reset your password.',
  },
} as const;

// One Tailwind style string reused by every input (so the template stays short)
const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200';

// ---------------------------------------------------------------------------
// State (the data this component keeps track of)
// ---------------------------------------------------------------------------

const user = ref<User | null>(null); // the signed-in user (null = signed out)
const authReady = ref<boolean>(false); // false until Firebase has checked the saved session

const dialogOpen = ref<boolean>(false); // is the popup window open?
const mode = ref<Mode>('login'); // which form is the popup showing?
const text = computed(() => TEXT[mode.value]);

const isSubmitting = ref<boolean>(false); // true while we wait for Firebase
const errorMsg = ref<string | null>(null); // red message inside the popup
const infoMsg = ref<string | null>(null); // green message inside the popup
const showPassword = ref<boolean>(false); // "Show / Hide" password toggle

// A banner shown OUTSIDE the popup (for example after a successful registration)
interface Notice {
  type: 'success' | 'error';
  text: string;
}
const notice = ref<Notice | null>(null);

// Lets us put the cursor inside the email box with code (see register())
const emailInput = ref<HTMLInputElement | null>(null);

// Everything the user types in the popup
const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  parentName: '',
  dogName: '',
});

// --- Debug panel state (token details) ---
interface TokenInfo {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  provider: string | null;
  issuedAt: string;
  expiresAt: string;
  token: string;
}

const debugOpen = ref<boolean>(true);
const tokenInfo = ref<TokenInfo | null>(null);
const tokenError = ref<string | null>(null);
const copied = ref<boolean>(false);

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

// ---------------------------------------------------------------------------
// Keep `user` in sync with Firebase
// ---------------------------------------------------------------------------

// Firebase remembers the session after a page refresh. This listener restores it
// and runs again every time someone signs in or out.
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

// Stop listening when the component is removed from the page
onUnmounted(() => {
  unsubscribe?.();
});

// ---------------------------------------------------------------------------
// Dialog helpers
// ---------------------------------------------------------------------------

// Switch the popup to another form (keeps the email the user already typed)
function switchMode(m: Mode): void {
  mode.value = m;
  errorMsg.value = null;
  infoMsg.value = null;
  showPassword.value = false;
  form.password = '';
  form.confirmPassword = '';
}

// Open the popup on a given form (used by the "Sign in" and "Register" buttons)
function openDialog(m: Mode): void {
  switchMode(m);
  dialogOpen.value = true;
}

// Clear everything every time the popup closes
watch(dialogOpen, (open: boolean) => {
  if (!open) {
    form.email = '';
    form.password = '';
    form.confirmPassword = '';
    form.parentName = '';
    form.dogName = '';
    errorMsg.value = null;
    infoMsg.value = null;
    showPassword.value = false;
  }
});

// Turn Firebase's technical error codes into messages a person can understand
function friendlyError(err: unknown): string {
  const code = (err as { code?: string }).code;
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please type a different email, or sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Wrong email or password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
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

// ---------------------------------------------------------------------------
// The actions: login, register, reset password, sign out, resend email
// ---------------------------------------------------------------------------

// Runs when the form is submitted. Picks the right action for the current mode.
async function onSubmit(): Promise<void> {
  errorMsg.value = null;
  infoMsg.value = null;
  isSubmitting.value = true;
  try {
    if (mode.value === 'login') await login();
    else if (mode.value === 'register') await register();
    else await resetPassword();
  } finally {
    isSubmitting.value = false; // always stop the spinner, success or not
  }
}

// 1) Sign in with an existing account
async function login(): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
    dialogOpen.value = false; // success: close the popup
  } catch (err: unknown) {
    console.error('[Login] sign-in failed:', (err as { code?: string }).code, err);
    errorMsg.value = friendlyError(err);
  }
}

// 2) Create a new account + save the user's dog
async function register(): Promise<void> {
  // Clean up what the user typed
  const email = form.email.trim().toLowerCase(); // emails are saved in lowercase
  const parentName = form.parentName.trim();
  const dogName = form.dogName.trim();

  // Check the form ourselves first (Firebase would not check these for us)
  if (!parentName || !dogName) {
    errorMsg.value = 'Please fill in your name and your dog name.';
    return;
  }
  if (form.password !== form.confirmPassword) {
    errorMsg.value = 'Passwords do not match.';
    return;
  }

  try {
    // Step 1: create the account. Firebase signs the new user in automatically.
    // If the email is already used, this line throws 'auth/email-already-in-use'.
    const cred = await createUserWithEmailAndPassword(auth, email, form.password);

    // Step 2: save the parent's name on the account (not critical, so errors are only logged)
    await updateProfile(cred.user, { displayName: parentName }).catch((e) =>
      console.error('[Register] could not save the name:', e),
    );

    // Step 3: send the "please verify your email" message
    let verifySent = true;
    try {
      await sendEmailVerification(cred.user);
    } catch (e) {
      verifySent = false;
      console.error('[Register] could not send the verification email:', e);
    }

    // Step 4: create the dog in Firestore.
    // The document ID is the user's uid, so every account can only have ONE dog.
    try {
      await setDoc(doc(db, 'bana_dogs', cred.user.uid), {
        bdname: dogName,
        bdparent: parentName,
        bdemail: email,
        bdid: 0,
        bdlevel: 1,
        bdalive: true,
        bdhealthy: true,
        bdpic: `https://api.dicebear.com/10.x/voxel-art/svg?seed=${encodeURIComponent(parentName)}`,
        bdpick: '',
        bdage: 1,
        visittime: 1,
      });
    } catch (e) {
      console.error('[Register] could not save the dog:', e);
      dialogOpen.value = false;
      notice.value = {
        type: 'error',
        text: 'Your account was created, but we could not save your dog. Please contact us.',
      };
      return;
    }

    // All done: close the popup and show a message
    dialogOpen.value = false;
    notice.value = {
      type: 'success',
      text: verifySent
        ? `Welcome, ${parentName}! We sent a verification email to ${email}. Please click the link inside it.`
        : `Welcome, ${parentName}! Your account is ready, but we could not send the verification email. Use "Resend email" to try again.`,
    };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    console.error('[Register] failed:', code, err);
    errorMsg.value = friendlyError(err);

    // Email already used: put the cursor in the email box so the user can type a new one
    if (code === 'auth/email-already-in-use') {
      await nextTick(); // wait for the page to update first
      emailInput.value?.focus();
      emailInput.value?.select();
    }
  }
}

// 3) "Forgot password": email a reset link
async function resetPassword(): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, form.email.trim());
    // We do not say whether the email exists (that would leak who has an account)
    infoMsg.value =
      'If an account exists for this email, we sent a password reset link. Please check your inbox (and spam folder).';
  } catch (err: unknown) {
    console.error('[Reset] failed:', (err as { code?: string }).code, err);
    errorMsg.value = friendlyError(err);
  }
}

// 4) Sign out
async function logout(): Promise<void> {
  await signOut(auth);
  notice.value = null;
}

// 5) Send the verification email again (for users who did not get it)
async function resendVerification(): Promise<void> {
  if (!user.value) return;
  try {
    await sendEmailVerification(user.value);
    notice.value = { type: 'success', text: `Verification email sent to ${user.value.email}.` };
  } catch (err: unknown) {
    notice.value = { type: 'error', text: friendlyError(err) };
  }
}

// --- Debug panel buttons ---
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

<template>
  <div class="flex flex-col gap-3">
    <!-- Top row: changes depending on whether someone is signed in -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Waiting for Firebase to restore the session -->
      <span v-if="!authReady" class="text-sm text-gray-400">Checking sign-in...</span>

      <!-- Signed in -->
      <template v-else-if="user">
        <span class="text-sm text-gray-600">
          Signed in as
          <span class="font-semibold text-gray-900">{{ user.displayName || user.email }}</span>
        </span>

        <!-- Only shown while the email is not verified yet -->
        <template v-if="!user.emailVerified">
          <span class="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
            Email not verified
          </span>
          <button
            class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            @click="resendVerification"
          >
            Resend email
          </button>
        </template>

        <button
          class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          @click="logout"
        >
          Sign out
        </button>
      </template>

      <!-- Signed out: two buttons that open the same popup in different modes -->
      <template v-else>
        <button
          class="rounded-md border border-yellow-600 bg-yellow-300 px-4 py-1.5 text-sm font-bold text-gray-900 transition hover:bg-yellow-400"
          @click="openDialog('login')"
        >
          Sign in
        </button>
        <button
          class="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
          @click="openDialog('register')"
        >
          Register
        </button>

        <!-- The popup window (shared by sign in / register / reset password) -->
        <DialogRoot v-model:open="dialogOpen">
          <DialogPortal>
            <DialogOverlay class="fixed inset-0 z-40 bg-black/50" />
            <DialogContent
              class="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-6 shadow-xl focus:outline-none"
            >
              <div class="mb-4 flex items-start justify-between">
                <DialogTitle class="text-lg font-semibold text-gray-900">
                  {{ text.title }}
                </DialogTitle>
                <!-- Invisible text for screen readers (also stops a console warning) -->
                <DialogDescription class="sr-only">{{ text.description }}</DialogDescription>
                <DialogClose
                  aria-label="Close"
                  class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <span aria-hidden="true">X</span>
                </DialogClose>
              </div>

              <form class="space-y-4" @submit.prevent="onSubmit">
                <!-- Email: used by all three modes -->
                <div>
                  <Label for="auth-email" class="mb-1 block text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <input
                    id="auth-email"
                    ref="emailInput"
                    v-model="form.email"
                    type="email"
                    required
                    autocomplete="email"
                    placeholder="you@example.com"
                    :class="inputClass"
                  />
                </div>

                <!-- Register only: parent name + dog name -->
                <template v-if="mode === 'register'">
                  <div>
                    <Label for="auth-parent" class="mb-1 block text-sm font-medium text-gray-700">
                      Your name (parent)
                    </Label>
                    <input
                      id="auth-parent"
                      v-model="form.parentName"
                      type="text"
                      required
                      maxlength="50"
                      placeholder="e.g. Chubaka"
                      :class="inputClass"
                    />
                  </div>

                  <div>
                    <Label for="auth-dog" class="mb-1 block text-sm font-medium text-gray-700">
                      Dog name
                    </Label>
                    <input
                      id="auth-dog"
                      v-model="form.dogName"
                      type="text"
                      required
                      maxlength="50"
                      placeholder="e.g. Han solo"
                      :class="inputClass"
                    />
                  </div>
                </template>

                <!-- Password: login and register (not reset) -->
                <div v-if="mode !== 'reset'">
                  <Label for="auth-password" class="mb-1 block text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div class="relative">
                    <input
                      id="auth-password"
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      :minlength="mode === 'register' ? 6 : undefined"
                      :autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
                      :class="[inputClass, 'pr-16']"
                    />
                    <button
                      type="button"
                      class="absolute inset-y-0 right-0 px-3 text-xs text-gray-500 hover:text-gray-800"
                      @click="showPassword = !showPassword"
                    >
                      {{ showPassword ? 'Hide' : 'Show' }}
                    </button>
                  </div>
                  <p v-if="mode === 'register'" class="mt-1 text-xs text-gray-500">
                    At least 6 characters.
                  </p>
                </div>

                <!-- Register only: type the password again -->
                <div v-if="mode === 'register'">
                  <Label for="auth-confirm" class="mb-1 block text-sm font-medium text-gray-700">
                    Confirm password
                  </Label>
                  <input
                    id="auth-confirm"
                    v-model="form.confirmPassword"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    autocomplete="new-password"
                    :class="inputClass"
                  />
                </div>

                <!-- Login only: link to the reset-password form -->
                <div v-if="mode === 'login'" class="text-right">
                  <button
                    type="button"
                    class="text-xs text-gray-500 underline hover:text-gray-800"
                    @click="switchMode('reset')"
                  >
                    Forgot password?
                  </button>
                </div>

                <!-- Messages -->
                <p v-if="errorMsg" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {{ errorMsg }}
                </p>
                <p v-if="infoMsg" class="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                  {{ infoMsg }}
                </p>

                <!-- Buttons -->
                <div class="flex justify-end gap-2 pt-2">
                  <DialogClose as-child>
                    <button
                      type="button"
                      :disabled="isSubmitting"
                      class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </DialogClose>
                  <button
                    type="submit"
                    :disabled="isSubmitting || !form.email"
                    class="inline-flex items-center gap-2 rounded-md border border-yellow-600 bg-yellow-300 px-4 py-2 text-sm font-bold text-gray-900 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span
                      v-if="isSubmitting"
                      class="h-4 w-4 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"
                    />
                    {{ isSubmitting ? text.loading : text.button }}
                  </button>
                </div>
              </form>

              <!-- Links to switch between the forms -->
              <p class="mt-4 text-center text-sm text-gray-500">
                <template v-if="mode === 'login'">
                  No account yet?
                  <button type="button" class="font-semibold text-gray-900 underline" @click="switchMode('register')">
                    Register
                  </button>
                </template>
                <template v-else-if="mode === 'register'">
                  Already have an account?
                  <button type="button" class="font-semibold text-gray-900 underline" @click="switchMode('login')">
                    Sign in
                  </button>
                </template>
                <template v-else>
                  <button type="button" class="font-semibold text-gray-900 underline" @click="switchMode('login')">
                    Back to sign in
                  </button>
                </template>
              </p>
            </DialogContent>
          </DialogPortal>
        </DialogRoot>
      </template>
    </div>

    <!-- Banner for messages that appear after the popup closes -->
    <div
      v-if="notice"
      class="flex w-full max-w-xl items-start justify-between gap-3 rounded-md px-3 py-2 text-sm"
      :class="notice.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'"
    >
      <span>{{ notice.text }}</span>
      <button class="text-gray-400 hover:text-gray-700" aria-label="Dismiss" @click="notice = null">X</button>
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