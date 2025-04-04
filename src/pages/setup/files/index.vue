<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { ref, onMounted } from 'vue';
import { default as UploadFile } from './UploadFile.vue';

// Reactive references
const search = ref('');
const currentPage = ref<number>(1);
const files = ref<{ id: number; path: string; created_at: string }[]>([]);
const filteredFiles = ref<{ id: number; path: string; created_at: string }[]>([]);
const loading = ref(true);

// Headers for the v-data-table
const headers = ref([
    { title: 'S/N', key: 'sn' },
    { title: 'File Name', key: 'path' },
    { title: 'Uploaded At', key: 'created_at' },
    { title: 'Actions', key: 'actions', sortable: false }
]);

const fetchFiles = async () => {
    try {
        loading.value = true;
        const response = await makeApiCall<{ id: number; path: string; created_at: string }[]>('GET', '/files');
        
        // Process and store data
        files.value = response.data.map((file, index) => ({
            sn: index + 1,
            ...file
        }));

        handleFilter();
    } catch (error) {
        console.error('Error fetching files:', error);
    } finally {
        loading.value = false;
    }
};

const handleFilter = () => {
    filteredFiles.value = files.value.filter(file =>
        file.path.toLowerCase().includes(search.value.toLowerCase())
    );
};

const handleUpdated = () => {
    fetchFiles();
};

onMounted(fetchFiles);
</script>

<template>
    <VRow class="mb-4">
        <UploadFile @fileUploaded="handleUpdated" />
    </VRow>

    <v-card flat>
        <v-card-title class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
            Uploaded Files
            <v-spacer></v-spacer>
            <v-text-field 
                v-model="search" 
                density="compact" 
                label="Search Files" 
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled" 
                flat 
                hide-details 
                single-line 
            />
        </v-card-title>

        <v-data-table :headers="headers" :items="filteredFiles" v-if="filteredFiles.length && !loading" sticky-header>
            <template v-slot:item.sn="{ index }">
                {{ index + 1 }}
            </template>

            <template v-slot:item.path="{ item }">
                <a :href="`/storage/${item.path}`" target="_blank">{{ item.path }}</a>
            </template>

            <template v-slot:item.created_at="{ item }">
                {{ new Date(item.created_at).toLocaleString() }}
            </template>

            <template v-slot:item.actions="{ item }">
                <VRow justify="end" align="center" style="flex-wrap:nowrap">
                    <DeleteBtn :api="`/files/${item.id}`" :item_name="'file'" @deleted="handleUpdated" />
                </VRow>
            </template>
        </v-data-table>

        <div v-if="loading" colspan="6" class="text-center" style="padding: 40px">
            <v-progress-circular indeterminate size="180" />
        </div>
    </v-card>
</template>
