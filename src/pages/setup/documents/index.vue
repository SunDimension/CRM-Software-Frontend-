<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { UploadDoc } from '@/types/globalTypes';
import { computed, onMounted, ref, reactive } from 'vue';
import { default as Create } from './add.vue';

// Reactive references
const search = ref('');
const data = ref<UploadDoc[]>([]);
const loading = ref(true);
const activeTab = ref(0);
const formStatus = reactive({
    personalInfo: false,
    emergencyContact: localStorage.getItem('emergencyContactCompleted') === 'true',
    education: localStorage.getItem('educationCompleted') === 'true',
    programChoices: localStorage.getItem('programChoicesCompleted') === 'true',
    aboutUs: localStorage.getItem('aboutUsCompleted') === 'true',
    documents: localStorage.getItem('documentsCompleted') === 'true'
});

// Table Headers
const headers = ref([
    { title: 'S/N', key: 'sn' },
    { title: 'Document ID', key: 'id' },
    { title: 'Document Name', key: 'file_title' },
    { title: 'Document Type', key: 'file_type_name' },
    { title: 'Date Created', key: 'created_at' },
    { title: '', key: 'actions', sortable: false }
]);

// Fetch data from API
const fetchData = async () => {
    try {
        loading.value = true;

        const response = await makeApiCall<UploadDoc[]>('GET', '/upload-docs');
        data.value = response.data.map((doc, index) => ({
            sn: index + 1,
            ...doc,
            // Make sure file_type_name is populated (in case API returns file_name or another property)
            file_type_name: doc.filetype_id?.name || doc.file_title || 'N/A'
        }));

        console.log('Fetched documents:', data.value);
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
    <v-row justify="center" class="mb-4">
        <v-col cols="12" md="6" class="text-center">
            <v-img src="/logo.jpg" alt="IEIS Logo" class="mx-auto mb-4" max-width="50"></v-img>
            <h1 class="text-h4 font-weight-bold text-center">APPLICATION FORM</h1>
        </v-col>
    </v-row>

    <!-- Form Tabs -->
    <v-tabs v-model="activeTab" background-color="primary" centered>
        <v-tab :to="{ name: 'personal-information-form' }">
            <v-icon start>mdi-account</v-icon>
            Personal Information
        </v-tab>

        <v-tab :to="{ name: 'emergency-contact' }" :disabled="!formStatus.personalInfo">
            <v-icon start>mdi-phone-alert</v-icon>
            Emergency Contact
            <v-icon v-if="formStatus.emergencyContact" end color="green">mdi-check-circle</v-icon>
        </v-tab>

        <v-tab :to="{ name: 'student-educational-qualifications' }" :disabled="!formStatus.emergencyContact">
            <v-icon start>mdi-school</v-icon>
            Student Educational Qualification
            <v-icon v-if="formStatus.education" end color="green">mdi-check-circle</v-icon>
        </v-tab>

        <v-tab :to="{ name: 'student-program-choices' }" :disabled="!formStatus.education">
            <v-icon start>mdi-book-open-variant</v-icon>
            Program Choices
            <v-icon v-if="formStatus.programChoices" end color="green">mdi-check-circle</v-icon>
        </v-tab>
        <v-tab :to="{ name: 'about-us' }" :disabled="!formStatus.programChoices">
            <v-icon start>mdi-information-outline</v-icon>
            About Us
            <v-icon v-if="formStatus.aboutUs" end color="green">mdi-check-circle</v-icon>
        </v-tab>

        <v-tab :to="{ name: 'documents' }" :disabled="!formStatus.aboutUs">
            <v-icon start>mdi-file-document</v-icon>
            Documents Attached
        </v-tab>
    </v-tabs>

    <VRow class="mb-4">
        <Create mode="create" @UploadDocCreated="handleUpdated" />
    </VRow>

    <v-card flat>
        <v-card-title class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
            Upload Documents
            <v-spacer></v-spacer>
            <v-text-field v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
                variant="solo-filled" flat hide-details single-line />
        </v-card-title>

        <v-data-table v-if="!loading" :headers="headers" :items="filteredData" sticky-header>
            <!-- S/N -->
            <template #item.sn="{ index }">
                {{ index + 1 }}
            </template>

            <!-- Document ID -->
            <template #item.id="{ item }">
                {{ item.id }}
            </template>

            <!-- Document Name -->
            <template #item.file_title="{ item }">
                {{ item.file_title ?? 'N/A' }}
            </template>

            <!-- Document Type -->
            <template #item.file_type_name="{ item }">
                {{ item.file_type_name }}
            </template>

            <!-- Date Created -->
            <template #item.created_at="{ item }">
                {{ new Date(item.created_at).toLocaleDateString() }}
            </template>

            <!-- Actions -->
            <template #item.actions="{ item }">
                <VRow justify="end" align="center" style="flex-wrap:nowrap">
                    <DeleteBtn :api="`/upload-docs/${item.id}`" item_name="upload document" @deleted="handleUpdated" />
                </VRow>
            </template>
        </v-data-table>

        <div v-if="loading" class="text-center py-8">
            <v-progress-circular indeterminate size="80" />
        </div>
    </v-card>
</template>
