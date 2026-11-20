
import { ref, onUnmounted } from "vue";

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  limit,
} from "firebase/firestore";

import { db, auth } from "../firebase";

export interface Dog {
  id?: string;
  bdid: number;
  bdname: string;
  bdemail: string;
  bdpic: string;
  bdlevel: number;
  bdalive: boolean;
  bdhealthy: boolean;
  bdpick: string;
  bdparent: string;
  bdage: number;
  visittime: number;
}

const COLLECTION = "bana_dogs";
const dogsCol = collection(db, COLLECTION);

// Admin email whitelist
const ADMIN_EMAILS = [
  "broccoli870523@gmail.com",
  "canadabroccoli@gmail.com",
  "sharptest@sharp.com",
  "chen0969@algonquinlive.com",
];

// Check current user
function getCurrentUser() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in.");
  }

  return user;
}

// Check admin
function isAdmin() {
  const user = auth.currentUser;

  return !!user?.email &&
    ADMIN_EMAILS.includes(user.email.toLowerCase());
}

// Sort dogs
const sortDogs = (list: Dog[]) =>
  [...list].sort((a, b) => (a.bdid ?? 0) - (b.bdid ?? 0));

// Convert Firestore document
const toDog = (d: any): Dog => ({
  ...(d.data() as Dog),
  id: d.id,
});

export function useDogs() {
  const dogs = ref<Dog[]>([]);
  const dog = ref<Dog | null>(null);

  const loading = ref(false);
  const error = ref<string | null>(null);
  let unsubscribe: (() => void) | null = null;

onUnmounted(() => {
  unsubscribe?.();
});

  // --------------------------------------------------
  // 1. FETCH DOGS
  // Admin: fetch all dogs
  // Customer: fetch own dog only
  // --------------------------------------------------

  async function fetchDogs() {
    loading.value = true;
    error.value = null;

    try {
      const user = getCurrentUser();

      if (isAdmin()) {
        // Admin reads all dogs
        const snap = await getDocs(dogsCol);

        dogs.value = sortDogs(
          snap.docs.map(toDog)
        );
      } else {
        // Customer reads own dog by UID
        const dogRef = doc(db, COLLECTION, user.uid);
        const snap = await getDoc(dogRef);

        dogs.value = snap.exists()
          ? [toDog(snap)]
          : [];
      }

    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }


  // --------------------------------------------------
  // 2. SUBSCRIBE DOGS
  // Admin: listen to all dogs
  // Customer: listen to own dog only
  // --------------------------------------------------


function subscribeDogs() {
  loading.value = true;
  error.value = null;

  try {
    const user = getCurrentUser();

    // Stop previous listener
    unsubscribe?.();

    if (isAdmin()) {
      // ADMIN: Listen to all dogs
      unsubscribe = onSnapshot(
        dogsCol,
        (snap) => {
          dogs.value = sortDogs(
            snap.docs.map(toDog)
          );

          loading.value = false;
        },
        (e: Error) => {
          error.value = e.message;
          loading.value = false;
        }
      );

    } else {
      // CUSTOMER: Listen to own dog only
      const dogRef = doc(db, COLLECTION, user.uid);

      unsubscribe = onSnapshot(
        dogRef,
        (snap) => {
          dogs.value = snap.exists()
            ? [toDog(snap)]
            : [];

          loading.value = false;
        },
        (e: Error) => {
          error.value = e.message;
          loading.value = false;
        }
      );
    }

  } catch (e: any) {
    error.value = e.message;
    loading.value = false;
  }
}



  // --------------------------------------------------
  // 3. FETCH MY DOG
  // Customer: fetch own dog by UID
  // Admin: can also fetch own dog by UID
  // --------------------------------------------------

  async function fetchMyDog() {
    loading.value = true;
    error.value = null;
    dog.value = null;

    try {
      const user = getCurrentUser();

      const dogRef = doc(db, COLLECTION, user.uid);
      const snap = await getDoc(dogRef);

      dog.value = snap.exists()
        ? toDog(snap)
        : null;

    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }


  // --------------------------------------------------
  // 4. FETCH DOG BY EMAIL
  // Customer: only their own email
  // Admin: can search any email
  // --------------------------------------------------

  async function fetchDogByEmail(email: string) {
    loading.value = true;
    error.value = null;
    dog.value = null;

    try {
      const user = getCurrentUser();
      const targetEmail = email.trim().toLowerCase();

      if (!isAdmin()) {
        // Customer can only access their own email
        if (user.email?.toLowerCase() !== targetEmail) {
          throw new Error("You can only access your own dog.");
        }

        const dogRef = doc(db, COLLECTION, user.uid);
        const snap = await getDoc(dogRef);

        dog.value = snap.exists()
          ? toDog(snap)
          : null;

      } else {
        // Admin can search by any email
        const q = query(
          dogsCol,
          where("bdemail", "==", targetEmail),
          limit(1)
        );

        const snap = await getDocs(q);

        dog.value = snap.empty
          ? null
          : toDog(snap.docs[0]);
      }

    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }


  // --------------------------------------------------
  // 5. ADD DOG
  // Customer: create dog using their UID
  // Admin: create dog with auto-generated document ID
  // --------------------------------------------------

  async function addDog(newDog: Omit<Dog, "id">) {
    const user = getCurrentUser();

    if (isAdmin()) {
      return await addDoc(dogsCol, newDog);
    }

    // Customer can only create their own dog
    if (newDog.bdemail.toLowerCase() !== user.email?.toLowerCase()) {
      throw new Error("Email does not match the logged-in user.");
    }

    const dogRef = doc(db, COLLECTION, user.uid);

    await setDoc(dogRef, newDog);

    return dogRef;
  }


  // --------------------------------------------------
  // 6. UPDATE DOG
  // Admin only
  // --------------------------------------------------

  const updateDog = (
    id: string,
    data: Partial<Dog>
  ) => {
    if (!isAdmin()) {
      throw new Error("Only admins can update dogs.");
    }

    const { id: _id, ...updateData } = data;

    return updateDoc(
      doc(db, COLLECTION, id),
      updateData
    );
  };


  // --------------------------------------------------
  // 7. DELETE DOG
  // Admin only
  // --------------------------------------------------

  const removeDog = (id: string) => {
    if (!isAdmin()) {
      throw new Error("Only admins can delete dogs.");
    }

    return deleteDoc(
      doc(db, COLLECTION, id)
    );
  };


  return {
    dogs,
    dog,
    loading,
    error,

    fetchDogs,
    subscribeDogs,
    fetchMyDog,
    fetchDogByEmail,

    addDog,
    updateDog,
    removeDog,
  };
}
