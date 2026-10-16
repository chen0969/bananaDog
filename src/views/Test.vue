<template>
  <div>
    <!-- Loading & Error States -->
    <p v-if="loading">Loading...</p>
    <p v-else-if="error" style="color: red;">{{ error }}</p>

    <!-- Display only the bdpic image -->
    <img v-else-if="imageUrl" :src="imageUrl" alt="Banana Dog" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const imageUrl = ref('');
const loading = ref(true);
const error = ref(null);

const apiUrl = 'https://firestore.googleapis.com/v1/projects/sharpinven/databases/(default)/documents/bana_dogs';

onMounted(async () => {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // Get the first document from the collection array
    const doc = data.documents[0];
    
    // Extract stringValue specifically from bdpic
    imageUrl.value = doc.fields.bdpic.stringValue;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>