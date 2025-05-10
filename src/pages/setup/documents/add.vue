<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { GenericSetUp, UploadDoc } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref, watch, onMounted } from 'vue';

// Props
const props = defineProps<{
    mode: 'create' | 'edit';
    uploadDoc?: UploadDoc;
}>();

const dialog = ref(false);
const apiError = ref<string | null>(null);
const emits = defineEmits(['UploadDocCreated']);
const attachFile = ref<File | null>(null); // Store a single file

const { handleSubmit, resetForm } = useForm();

// Fields with Validation
const file_title = useField<string>('file_title', (value) => value?.trim() ? true : 'File title is required.');
const filetype_id = useField<number | null>('filetype_id', (value) => value ? true : 'File type is required.');
const fileTypes = ref<GenericSetUp[]>([]); // Store file types fetched from the API

const loading = ref(false);

// Retrieve application ID from localStorage
const applicationId = ref<number | null>(null);
const storedAppId = localStorage.getItem('applicationId');
if (storedAppId) {
    applicationId.value = parseInt(storedAppId, 10);
} else {
    console.error('Application ID not found in localStorage.');
}

// Fetch File Types from API
const fetchFileTypes = async () => {
    try {
        console.log('[fetchFileTypes] Fetching file types...');
        const response = await makeApiCall<GenericSetUp[]>('GET', '/file_type');

        fileTypes.value = Array.isArray(response.data) ? response.data : []; // Ensure response is an array
        console.log('[fetchFileTypes] File Types:', fileTypes.value);
    } catch (error) {
        console.error('[fetchFileTypes] Error fetching file types:', error);
        apiError.value = 'Failed to load file types.';
    }
};

// Load data for edit mode
const loadDataForEdit = () => {
    if (props.mode === 'edit' && props.uploadDoc) {
        file_title.value.value = props.uploadDoc.file_title ?? '';
        // Update to use the correct field name
        filetype_id.value.value = props.uploadDoc.filetype_id ?? null;
    }
};

// Watch for changes in props to update form data
watch(() => props.uploadDoc, loadDataForEdit, { immediate: true });

// Handle file upload
const handleFileUpload = (event: Event) => {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0] || null;

    if (!file) {
        apiError.value = "Please select a file.";
        attachFile.value = null;
        return;
    }

    // Validate file size
    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
        apiError.value = `File size should not exceed ${maxSizeMB}MB.`;
        attachFile.value = null;
        return;
    }

    attachFile.value = file; // Store file correctly
    apiError.value = null;
};

// Submit Form
const submit = async () => {
    loading.value = true;
    apiError.value = null;

    try {
        const formData = new FormData();

        // Append text fields
        formData.append('file_title', file_title.value.value || '');
        formData.append('filetype_id', filetype_id.value.value?.toString() || ''); // Fixed field name
        formData.append('application_id', applicationId.value?.toString() || ''); // Append application ID

        // Ensure a file is selected before submitting
        if (!attachFile.value) {
            apiError.value = "Please select a file before submitting.";
            loading.value = false;
            return;
        }

        // Append file properly
        formData.append('attach_file', attachFile.value, attachFile.value.name);

        // Debugging step: Log FormData content
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        // Define API URL & Method
        const apiUrl = props.mode === 'edit' ? `/upload-docs/${props.uploadDoc?.id}` : `/upload-docs`;
        const apiMethod = props.mode === 'edit' ? 'PUT' : 'POST';

        // Ensure correct headers
        await makeApiCall<UploadDoc>(apiMethod, apiUrl, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        emits('UploadDocCreated');
        dialog.value = false;
    } catch (error: any) {
        apiError.value = error.response?.data?.message || "An unexpected error occurred.";
    } finally {
        loading.value = false;
    }
};

// Fetch file types on component mount
onMounted(() => {
    fetchFileTypes();
});
</script>

<template>
    <VDialog v-model="dialog" persistent max-width="600px">
        <template #activator="{ props }">
            <VBtn v-bind="props" size="small" :color="mode === 'edit' ? 'warning' : 'primary'">
                {{ mode === 'edit' ? 'Edit' : 'Add' }}
            </VBtn>
        </template>

        <VCard>
            <VCardTitle>
                <span class="text-h5">{{ mode === 'edit' ? 'Edit Document' : 'Upload New Document' }}</span>
            </VCardTitle>

            <VCardText>
                <VForm @submit.prevent="submit">
                    <VRow dense>
                        <!-- File Type Selection -->
                        <VCol cols="12" md="6">
                            <v-select v-model="filetype_id.value.value" :items="fileTypes" label="Select File Type"
                                item-title="name" item-value="id"
                                :error-messages="filetype_id.errorMessage.value || (fileTypes.length === 0 ? 'No file types available' : '')"
                                required />
                        </VCol>

                        <!-- File Title -->
                        <VCol cols="12" md="6">
                            <VTextField v-model="file_title.value.value" label="File Title"
                                :error-messages="file_title.errorMessage.value" required />
                        </VCol>

                        <!-- File Upload -->
                        <VCol cols="12">
                            <VFileInput label="Attach File" @change="handleFileUpload"
                                accept=".pdf,.doc,.docx,.jpg,.png" />
                        </VCol>

                        <!-- Error Message -->
                        <VCol cols="12" v-if="apiError">
                            <VAlert type="error" class="mt-3">
                                {{ apiError }}
                            </VAlert>
                        </VCol>
                    </VRow>

                    <!-- Form Actions -->
                    <VCardActions>
                        <VSpacer />
                        <VBtn color="grey" @click="dialog = false">Cancel</VBtn>
                        <VBtn :loading="loading" color="primary" type="submit">
                            {{ mode === 'edit' ? 'Update' : 'Upload' }}
                        </VBtn>
                    </VCardActions>
                </VForm>
            </VCardText>
        </VCard>
    </VDialog>
</template>
