<template>
    <v-container fluid>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title class="headline">Find & Share Documents</v-card-title>

                    <!-- Alerts -->
                    <v-alert v-if="loading" type="info" elevation="2">Loading documents...</v-alert>
                    <v-alert v-if="error" type="error" elevation="2">{{ error }}</v-alert>
                    <v-alert v-if="showFilterError" type="error" elevation="2">Please select required filters.</v-alert>

                    <!-- Filters -->
                    <v-row class="mt-4">
                        <v-col cols="12" md="3">
                            <v-text-field v-model="fromDate" label="From Date" type="date" required />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-text-field v-model="toDate" label="To Date" type="date" :min="fromDate" required />
                        </v-col>
                        <v-col cols="12" md="3">
                            <filterSelect :genericOptions="companies" label_cus="Select Company"
                                v-model="selectedCompany" item-value="id" item-text="name"
                                :loading="loadingCompanies" />
                        </v-col>
                        <v-col cols="12" md="3">
                            <filterSelect v-model="selectedPrimaryFolder" :genericOptions="primaryFolders"
                                label="Select Primary Folder" item-value="id" item-text="name"
                                :loading="loadingPrimaryFolders" :disabled="!selectedCompany" />
                        </v-col>
                        <v-col cols="12" md="3">
                            <filterSelect v-model="selectedSubfolder" :genericOptions="subfolders"
                                label="Select Subfolder" item-value="id" item-text="name" :loading="loadingSubfolders"
                                :disabled="!selectedPrimaryFolder" />
                        </v-col>
                    </v-row>

                    <!-- Fetch Data Button -->
                    <v-row class="mt-4">
                        <v-col cols="6" class="text-right">
                            <v-btn @click="fetchFilteredUploads" color="primary">View</v-btn>
                        </v-col>
                    </v-row>

                    <!-- Results Table -->
                    <v-table v-if="filteredUploads.length > 0" class="mt-4">
                        <thead>
                            <tr>
                                <th>Company Name</th>
                                <th>Primary Folder</th>
                                <th>File Title</th>
                                <th>Description</th>
                                <th>Financial Value (₦)</th>
                                <th>Expiry Date</th>
                                <th>Attached File</th>
                                <th>Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="upload in filteredUploads" :key="upload.id">
                                <td>{{ upload.company?.name || 'N/A' }}</td>
                                <td>{{ upload.primary_folder?.name || 'N/A' }}</td>
                                <td>{{ upload.file_title }}</td>
                                <td>{{ upload.file_description }}</td>
                                 <td>{{ formatNumber(upload?.financial_value) }}</td>
                                <td>{{ upload.file_expiry_date }}</td>
                                <td>
                                    <a v-if="upload.attach_file?.file_url" :href="upload.attach_file.file_url"
                                        target="_blank" class="text-blue-500 hover:underline">
                                        {{ upload.attach_file.name }}
                                    </a>
                                    <span v-else>N/A</span>
                                </td>
                                <td>
                                    <v-menu>
                                        <template v-slot:activator="{ props }">
                                            <v-btn color="primary" v-bind="props" icon>
                                                <v-icon>ri-share-line</v-icon>
                                            </v-btn>
                                        </template>

                                        <v-list>
                                            <v-list-item v-for="platform in sharingPlatforms" :key="platform.name"
                                                @click="shareOnPlatform(upload, platform.name)">
                                                <v-list-item-title>
                                                    <v-icon :color="platform.color">{{ platform.icon }}</v-icon>
                                                    {{ platform.label }}
                                                </v-list-item-title>
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
    <ShareDialog ref="shareDialog" />
</template>

<script setup>
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { ref, watch } from 'vue';
import { formatDate, formatNumber } from '@/types/globalTypes'

// Sharing functionality
const sharingPlatforms = [
    { name: 'email', icon: 'ri-mail-line', label: 'Email', color: 'primary' },
    { name: 'whatsapp', icon: 'ri-whatsapp-line', label: 'WhatsApp', color: 'green' },
    { name: 'telegram', icon: 'ri-telegram-line', label: 'Telegram', color: 'blue' },
    { name: 'copy', icon: 'ri-file-copy-line', label: 'Copy Link', color: 'grey' }
];

const shareOnPlatform = (document, platform) => {
    const url = encodeURIComponent(document.attach_file?.file_url || '');
    const title = encodeURIComponent(document.file_title || '');

    const shareUrls = {
        whatsapp: `https://wa.me/?text=${title}%20${url}`,
        telegram: `https://t.me/share/url?url=${url}&text=${title}`,
        email: `mailto:?subject=${title}&body=Check%20this%20document:%20${url}`,
        copy: () => navigator.clipboard.writeText(url)

    };

    if (platform === 'copy') {
        navigator.clipboard.writeText(document.attach_file?.file_url || '');
        // You might want to add a toast notification here
    } else if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank');
    }
};

// Filter and data fetching logic
const loading = ref(false);
const loadingCompanies = ref(false);
const loadingPrimaryFolders = ref(false);
const loadingSubfolders = ref(false);
const error = ref(null);
const showFilterError = ref(false);
const fromDate = ref(null);
const toDate = ref(null);
const selectedCompany = ref(null);
const selectedPrimaryFolder = ref(null);
const selectedSubfolder = ref(null);
const companies = ref([]);
const primaryFolders = ref([]);
const subfolders = ref([]);
const filteredUploads = ref([]);

// Fetch companies
const fetchCompanies = async () => {
    loadingCompanies.value = true;
    try {
        const response = await makeApiCall('GET', '/companies');
        companies.value = response.data;
    } catch (err) {
        error.value = 'Error fetching companies.';
    } finally {
        loadingCompanies.value = false;
    }
};

// Fetch primary folders when a company is selected
const fetchPrimaryFolders = async () => {
    if (!selectedCompany.value) {
        primaryFolders.value = [];
        return;
    }

    try {
        const companyId = Number(selectedCompany.value?.id);
        if (!Number.isInteger(companyId) || companyId <= 0) {
            throw new Error("Invalid company ID");
        }

        const response = await makeApiCall(
            "GET",
            `/primary-folders-companies?company_id=${companyId}`
        );
        primaryFolders.value = response.data;
        selectedPrimaryFolder.value = null;
    } catch (err) {
        console.error("Error fetching primary folders:", err.message);
    }
};

const fetchSubfolders = async () => {
    if (!selectedPrimaryFolder.value) {
        subfolders.value = [];
        return;
    }

    try {
        const primaryFolderId = Number(selectedPrimaryFolder.value?.id);
        if (!Number.isInteger(primaryFolderId) || primaryFolderId <= 0) {
            throw new Error("Invalid primary folder ID");
        }

        const response = await makeApiCall(
            "GET",
            `/subfolders-companies?primary_folder_id=${primaryFolderId}`
        );
        subfolders.value = response.data;
        selectedSubfolder.value = null;
    } catch (err) {
        console.error("Error fetching subfolders:", err.message);
    }
};

// Fetch filtered uploads
const fetchFilteredUploads = async () => {
    if (!fromDate.value || !toDate.value || !selectedCompany.value || !selectedPrimaryFolder.value || !selectedSubfolder.value) {
        showFilterError.value = true;
        return;
    }
    showFilterError.value = false;
    loading.value = true;
    try {
        const params = {
            from_date: fromDate.value,
            to_date: toDate.value,
            company_id: parseInt(selectedCompany.value, 10),
            primary_folder_id: parseInt(selectedPrimaryFolder.value, 10),
            subfolder_id: parseInt(selectedSubfolder.value, 10),
        };
        const response = await makeApiCall('POST', '/share-upload-doc', params);
        filteredUploads.value = response.data || [];
    } catch (err) {
        error.value = 'Error fetching documents.';
    } finally {
        loading.value = false;
    }
};

const viewFile = (fileId) => {
    window.open(`/api/view-file/${fileId}`, '_blank');
};

// Watchers
watch(selectedCompany, fetchPrimaryFolders);
watch(selectedPrimaryFolder, fetchSubfolders);

// Initial fetch
fetchCompanies();
</script>

<style scoped>
.share-buttons {
    display: flex;
    gap: 4px;
}
</style>
