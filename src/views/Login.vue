<script setup lang="ts">
import LoginForm from '../components/Login.vue';
import bdog from '../assets/bd-dog.svg';
</script>

<template>
    <div class="flex flex-col items-center gap-3 pt-5">
        <h1 class="text-2xl font-bold text-center subpixel-antialiased">Let's Meet your dog!</h1>
        <img :src="bdog" alt="bdog" class="w-full h-full object-cover" />
    </div>
    <div class="flex flex-col items-center">
        <LoginForm />
        <h2>
            <span class="text-gray-500">No dog yet? </span>
            <RouterLink to="/Signup" class="text-blue-600 text-lg"
                active-class="text-blue-600">Register
            </RouterLink>
        </h2>
    </div>
</template>