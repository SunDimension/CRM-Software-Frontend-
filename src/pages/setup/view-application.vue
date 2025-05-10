<script setup lang="ts">
import CardStatisticsVertical from '@core/components/cards/CardStatisticsVertical.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Table headers for application history
const applicationHeaders = [
    { title: 'S/N', key: 'sn' },
    { title: 'Application ID', key: 'id' },
    { title: 'Application Title', key: 'title' },
    { title: 'Student Name', key: 'studentName' },
    { title: 'Status', key: 'status' },
    { title: 'Date Created', key: 'createdAt' },
]

// Sample data for the application history table
const applicationHistory = ref([
    {
        id: 'APP001',
        title: 'Scholarship Application',
        studentName: 'John Doe',
        status: 'Pending',
        createdAt: '2024-03-15',
    },
    {
        id: 'APP002',
        title: 'Course Registration',
        studentName: 'Jane Smith',
        status: 'Approved',
        createdAt: '2024-03-14',
    },
])

const addApplication = () => {
    // Navigate to the Personal Information page
    router.push('/setup/personal-information-form')
}
</script>

<template>
    <VRow class="match-height">
        <VCol cols="12" class="mb-4">
            <!-- Add Application Button at the top -->
            <VBtn color="primary" @click="addApplication">
                Add Application
            </VBtn>
        </VCol>

        <!-- Application History Section -->
        <VCol cols="12">
            <VCard title="Application History">
                <VDataTable :headers="applicationHeaders" :items="applicationHistory" :items-per-page="10"
                    class="text-no-wrap">
                    <template #item.status="{ item }">
                        <VChip
                            :color="item.status === 'Approved' ? 'success' : item.status === 'Rejected' ? 'error' : 'warning'"
                            size="small" class="text-capitalize">
                            {{ item.status }}
                        </VChip>
                    </template>
                </VDataTable>
            </VCard>
        </VCol>
    </VRow>
</template>
