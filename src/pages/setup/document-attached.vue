<script setup lang="ts">
import { ref } from 'vue'
const documentHeaders = [
    { title: 'S/N', key: 'sn' },
    { title: 'Document ID', key: 'id' },
    { title: 'Document Name', key: 'name' },
    { title: 'Document Type', key: 'type' },
    { title: 'Application ID', key: 'applicationId' },
    { title: 'Date Created', key: 'createdAt' },
]

const documentList = ref([
    {
        id: 'DOC001',
        name: 'Transcript',
        type: 'Academic',
        applicationId: 'APP001',
        createdAt: '2024-03-15',
    },
    {
        id: 'DOC002',
        name: 'Recommendation Letter',
        type: 'Reference',
        applicationId: 'APP002',
        createdAt: '2024-03-14',
    },
])



// Function to handle new document button click
const handleNewDocument = () => {
    // Add your logic for creating a new document here
    console.log('New document button clicked')
}


</script>
<template>


    <!-- Document List Section -->
    <VCol cols="12">
        <VCard title="Document List">
            <template #append>
                <VBtn color="primary" prepend-icon="ri-add-line" @click="handleNewDocument">
                    New Document
                </VBtn>
            </template>
            <VDataTable :headers="documentHeaders" :items="documentList" :items-per-page="10" class="text-no-wrap">
                <template #item.sn="{ index }">
                    {{ index + 1 }}
                </template>
            </VDataTable>
        </VCard>
    </VCol>
</template>
