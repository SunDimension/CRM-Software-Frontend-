<script setup lang="ts">
import { useAuthStore } from '@/store/auth'
import StudentDashboard from '@/views/dashboard/StudentDashboard.vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authState = useAuthStore()

onMounted(() => {
    // Only check if user is logged in
    if (!authState.isLoggedIn) {
        router.push('/login')
        return
    }

    // No role check here to avoid redirect loop
    // The router navigation guard will handle role-based routing
})
</script>

<template>
    <StudentDashboard />
</template>
