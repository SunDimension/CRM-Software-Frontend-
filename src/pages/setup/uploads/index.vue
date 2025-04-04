<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { GenericSetUp, Subfolder, UploadDoc } from '@/types/globalTypes';
import { computed, onMounted, ref } from 'vue';
import { default as Create } from './add.vue';

// Reactive references
const search = ref('');
const data = ref<UploadDoc[]>([]);
const fileTypes = ref<GenericSetUp[]>([]);
const subfolders = ref<Subfolder[]>([]);
const loading = ref(true);

// Table Headers
const headers = ref([
    { title: 'S/N', key: 'sn' },
    { title: 'Company', key: 'company' }, // ✅ Add Company
    { title: 'Primary Folder', key: 'primary_folder' }, // ✅ Add Primary Folder
    { title: 'Sub Folder', key: 'sub_folder' },
    { title: 'File Title', key: 'file_title' },
    { title: 'File Type', key: 'file_type' },
    { title: 'File Description', key: 'file_description' },
    { title: 'Attach File', key: 'attach_file' },
    { title: '', key: 'actions', sortable: false }
]);


// Fetch data from API
const fetchData = async () => {
    try {
        loading.value = true;

        const [uploadDocsResponse, fileTypeResponse, subfolderResponse] = await Promise.all([
            makeApiCall<UploadDoc[]>('GET', '/upload-docs'),
            makeApiCall<GenericSetUp[]>('GET', '/filetypes'),
            makeApiCall<Subfolder[]>('GET', '/subfolders')
        ]);

        fileTypes.value = fileTypeResponse.data;
        subfolders.value = subfolderResponse.data;

        data.value = uploadDocsResponse.data.map((doc, index) => ({
            sn: index + 1,
            sub_folder: doc.subfolder_id ?? null,
            file_type: doc.file_type ?? null, // ✅ Ensure this is correctly mapped
            ...doc,
            primary_folder: doc.primary_folder || null,
            company: doc.company || null,
        }));

    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        loading.value = false;
    }
};


// Computed Property for Filtering
const filteredData = computed(() =>
    data.value.filter(doc =>
        (doc.file_title ?? '').toLowerCase().includes(search.value.toLowerCase())
    )
);

// Handle Update Event
const handleUpdated = () => {
    fetchData();
};

// Fetch data on component mount
onMounted(fetchData);
</script>

<template>
    <VRow class="mb-4">
        <Create mode="create" @UploadDocCreated="handleUpdated" :subfolders="subfolders" :fileTypes="fileTypes" />
    </VRow>

    <v-card flat>
        <v-card-title class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
            Upload Documents
            <v-spacer></v-spacer>
            <v-text-field v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
                variant="solo-filled" flat hide-details single-line />
        </v-card-title>

        <v-data-table v-if="!loading" :headers="headers" :items="filteredData" sticky-header>
            <template #item.sn="{ index }">
                {{ index + 1 }}
            </template>
            <template #item.company="{ item }">
                {{ item.company?.name ?? 'Unknown' }}
            </template>
            <template #item.primary_folder="{ item }">
                {{ item.primary_folder?.name ?? 'Unknown' }}
            </template>




            <template #item.sub_folder="{ item }">
                {{ item.sub_folder?.name ?? 'Unknown' }}
            </template>



            <template #item.file_title="{ item }">
                {{ item.file_title ?? 'N/A' }}
            </template>

            <!-- <template #item.file_type="{ item }">
    {{ item.filetype_id?.name ?? 'Unknown' }}
</template> -->

            <template #item.file_type="{ item }">
                {{ item.file_type?.name ?? 'Unknown' }}
            </template>



            <template #item.file_description="{ item }">
                {{ item.file_description ?? 'N/A' }}
            </template>

       <template #item.attach_file="{ item }">
    <div class="d-flex align-center">
        <v-icon class="me-2">ri-attachment-2</v-icon>
        <a v-if="item.attach_file?.file_url" :href="item.attach_file.file_url" target="_blank" rel="noopener noreferrer" style="text-decoration: none; pointer-events: none;">
            {{ item.attach_file.name ?? 'View File' }}
        </a>
        <span v-else>N/A</span>
    </div>
</template>









            <template #item.actions="{ item }">
                <VRow justify="end" align="center" style="flex-wrap:nowrap">
                    <!-- <Edit mode="edit" @UploadDocCreated="handleUpdated" :subfolders="subfolders" :fileTypes="fileTypes"
                        :uploadDoc="item" /> -->
                    <DeleteBtn :api="`/upload-docs/${item.id}`" item_name="upload document" @deleted="handleUpdated" />
                </VRow>
            </template>
        </v-data-table>

        <div v-if="loading" class="text-center py-8">
            <v-progress-circular indeterminate size="80" />
        </div>
    </v-card>
</template>
