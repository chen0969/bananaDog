import { ref, onUnmounted } from "vue";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

export interface Dog {
  id?: string;        // Firestore document ID (e.g. HknkliJCTLqcQdBfrLxs)
  bdid: number;
  bdname: string;
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

const sortDogs = (list: Dog[]) => [...list].sort((a, b) => (a.bdid ?? 0) - (b.bdid ?? 0));
const toDog = (d: { id: string; data: () => unknown }): Dog => ({ ...(d.data() as Dog), id: d.id });

export function useDogs() {
  const dogs = ref<Dog[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // One-time fetch (same as your GET)
  async function fetchDogs() {
    loading.value = true;
    error.value = null;
    try {
      const snap = await getDocs(dogsCol);
      dogs.value = sortDogs(snap.docs.map(toDog));
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  // Live updates
  function subscribeDogs() {
    loading.value = true;
    const unsub = onSnapshot(
      dogsCol,
      snap => {
        dogs.value = sortDogs(snap.docs.map(toDog));
        loading.value = false;
      },
      e => {
        error.value = e.message;
        loading.value = false;
      },
    );
    onUnmounted(unsub);
  }

  const addDog = (dog: Omit<Dog, "id">) => addDoc(dogsCol, dog);
  const updateDog = (id: string, data: Partial<Dog>) => updateDoc(doc(db, COLLECTION, id), data);
  const removeDog = (id: string) => deleteDoc(doc(db, COLLECTION, id));

  return { dogs, loading, error, fetchDogs, subscribeDogs, addDog, updateDog, removeDog };
}