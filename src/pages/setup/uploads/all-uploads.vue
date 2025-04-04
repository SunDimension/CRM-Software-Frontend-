<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="headline">All Upload Documents</v-card-title>

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
              <filterSelect :genericOptions="companies" label_cus="Select Company" v-model="selectedCompany"
                item-value="id" item-text="name" :loading="loadingCompanies" />
            </v-col>
            <v-col cols="12" md="3">
              <filterSelect v-model="selectedPrimaryFolder" :genericOptions="primaryFolders"
                label="Select Primary Folder" item-value="id" item-text="name" :loading="loadingPrimaryFolders"
                :disabled="!selectedCompany" />
            </v-col>
            <v-col cols="12" md="3">
              <filterSelect v-model="selectedSubfolder" :genericOptions="subfolders" label="Select Subfolder"
                item-value="id" item-text="name" :loading="loadingSubfolders" :disabled="!selectedPrimaryFolder" />
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
                <th>Financial Value</th>
                <th>Expiry Date</th>
                <th>Attached File</th>
                <!-- <th>Actions</th> -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="upload in filteredUploads" :key="upload.id">
                <td>{{ upload.company?.name || 'N/A' }}</td>
                <td>{{ upload.primary_folder?.name || 'N/A' }}</td>
                <td>{{ upload.file_title }}</td>
                <td>{{ upload.file_description }}</td>
                <td>{{ upload.financial_value }}</td>
                <td>{{ upload.file_expiry_date }}</td>
                <td>
                  <a v-if="upload.attach_file?.file_url" :href="upload.attach_file.file_url" target="_blank"
                    class="text-blue-500 hover:underline">
                    {{ upload.attach_file.name }}
                  </a>
                  <span v-else>N/A</span>
                </td>
                <!-- <td>
                  <v-btn small @click="viewFile(upload.attach_file)" icon>
                    <v-icon>ri-eye-line</v-icon>
                  </v-btn>
                </td> -->
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { ref, watch } from 'vue';

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
// const companyId = Number(selectedCompany.value?.id);

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
  console.log("fetchPrimaryFolders called", selectedCompany.value); // Debugging

  // Ensure selectedCompany has a valid value
  if (!selectedCompany.value) {
    console.warn("No company selected. Clearing primary folders.");
    primaryFolders.value = [];
    return;
  }

  try {
    // Ensure selectedCompany.value is a valid integer
    const companyId = Number(selectedCompany.value?.id);
    if (!Number.isInteger(companyId) || companyId <= 0) {
      throw new Error("Invalid company ID: " + selectedCompany.value);
    }

    // Make API call
    const response = await makeApiCall(
      "GET",
      `/primary-folders-companies?company_id=${companyId}`
    );

    console.log("Primary Folders Response:", response.data); // Debugging
    primaryFolders.value = response.data;
    selectedPrimaryFolder.value = null; // Reset primary folder selection
  } catch (err) {
    console.error("Error fetching primary folders:", err.message);
  }
};

const fetchSubfolders = async () => {
  console.log("fetchSubfolders called", selectedPrimaryFolder.value); // Debugging

  // Ensure selectedPrimaryFolder has a valid value
  if (!selectedPrimaryFolder.value) {
    console.warn("No primary folder selected. Clearing subfolders.");
    subfolders.value = [];
    return;
  }

  try {
    // Ensure selectedPrimaryFolder.value is a valid integer
    const primaryFolderId = Number(selectedPrimaryFolder.value?.id);
    if (!Number.isInteger(primaryFolderId) || primaryFolderId <= 0) {
      throw new Error("Invalid primary folder ID: " + selectedPrimaryFolder.value);
    }

    // Make API call
    const response = await makeApiCall(
      "GET",
      `/subfolders-companies?primary_folder_id=${primaryFolderId}`
    );

    console.log("Subfolders Response:", response.data); // Debugging
    subfolders.value = response.data;
    selectedSubfolder.value = null; // Reset subfolder selection
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
      company_id: parseInt(selectedCompany.value, 10), // Ensure integer
      primary_folder_id: parseInt(selectedPrimaryFolder.value, 10), // Ensure integer
      subfolder_id: parseInt(selectedSubfolder.value, 10), // Ensure integer
    };
    const response = await makeApiCall('POST', '/search-upload-doc', params);
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

watch(selectedCompany, (newValue, oldValue) => {
  console.log('Selected Company Changed:', newValue, typeof newValue); // Debugging
  fetchPrimaryFolders();
});

// Watch for changes in selectedPrimaryFolder
watch(selectedPrimaryFolder, (newValue, oldValue) => {
  console.log('Selected Primary Folder Changed:', newValue, typeof newValue); // Debugging
  fetchSubfolders();
});
// Initial fetch
fetchCompanies();
</script>
