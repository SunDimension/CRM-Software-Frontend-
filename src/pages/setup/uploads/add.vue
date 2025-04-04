<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { GenericSetUp, Subfolder, UploadDoc } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref, watch } from 'vue';

// Props
const props = defineProps<{
    subfolders: Subfolder[];
    fileTypes: GenericSetUp[];
    mode: 'create' | 'edit';
    uploadDoc?: UploadDoc;
}>();

const dialog = ref(false);
const apiError = ref<string | null>(null);
const emits = defineEmits(['UploadDocCreated']);
const fileTitle = ref('');
const fileDescription = ref('');
const financialValue = ref('');
const fileExperyDate = ref('')

const { handleSubmit, resetForm } = useForm();

// Fields with Validation
const file_title = useField<string>('file_title', (value) => value?.trim() ? true : 'File title is required.');
const file_description = useField<string>('file_description', (value) => value?.trim() ? true : 'File description is required.');

const selectedSubFolder = ref<Subfolder | null>(null);
const selectedFileType = ref<GenericSetUp | null>(null);
const attachFile = ref<File | null>(null);  // ✅ Store a single file, not an array


const loading = ref(false);

// Load data for edit mode
const loadDataForEdit = () => {
    if (props.mode === 'edit' && props.uploadDoc) {
        file_title.value.value = props.uploadDoc.file_title ?? '';
        file_description.value.value = props.uploadDoc.file_description ?? '';
       
        selectedSubFolder.value = props.subfolders.find(c => c.id === props.uploadDoc?.subfolder_id) ?? props.subfolders[0];
        selectedFileType.value = props.fileTypes.find(ft => ft.id === props.uploadDoc?.filetype_id) ?? props.fileTypes[0];
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

    // ✅ Validate file size
    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
        apiError.value = `File size should not exceed ${maxSizeMB}MB.`;
        attachFile.value = null;
        return;
    }

    attachFile.value = file;  // ✅ Store file correctly
    apiError.value = null;
};



// Upload File API Call
async function uploadFile(file: File): Promise<{ id: number; name: string; file_url: string }> {
    const formData = new FormData();
    formData.append('attach_file', file); // Laravel expects 'attach_file' key

    const response = await makeApiCall<{ id: number; name: string; file_url: string }>(
        'POST',
        '/upload-docs',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data; // ✅ Now TypeScript knows the exact structure
}


// Submit Form
const submit = async () => {
    loading.value = true;
    apiError.value = null;

    try {
        const formData = new FormData();

        // ✅ Append text fields
        formData.append('file_title', file_title.value.value || '');
        formData.append('file_description', file_description.value.value || '');
        formData.append('financial_value', financialValue.value || '');
        formData.append('file_expiry_date', fileExperyDate.value || '');

        formData.append('subfolder_id', selectedSubFolder.value?.id?.toString() || '');
        formData.append('filetype_id', selectedFileType.value?.id?.toString() || '');

        // ✅ Ensure a file is selected before submitting
        if (!attachFile.value) {
            apiError.value = "Please select a file before submitting.";
            loading.value = false;
            return;
        }

        // ✅ Append file properly
        formData.append('attach_file', attachFile.value, attachFile.value.name);

        // ✅ Debugging step: Log FormData content
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        // Define API URL & Method
        const apiUrl = props.mode === 'edit' ? `/upload-docs/${props.uploadDoc?.id}` : `/upload-docs`;
        const apiMethod = props.mode === 'edit' ? 'PUT' : 'POST';

        // ✅ Ensure correct headers
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
                        <!-- Subfolder Selection -->
                        <VCol cols="12" md="6">
                            <v-select v-model="selectedSubFolder" :items="subfolders" label="Select Subfolder"
                                item-title="name" item-value="id" return-object required />
                        </VCol>

                        <!-- File Type Selection -->
                        <VCol cols="12" md="6">
                            <v-select v-model="selectedFileType" :items="fileTypes" label="Select File Type"
                                item-title="name" item-value="id" return-object required />
                        </VCol>

                        <!-- File Title -->
                        <VCol cols="12" md="6">
                            <VTextField v-model="file_title.value.value" label="File Title"
                                :error-messages="file_title.errorMessage.value" required />
                        </VCol>

                        <!-- File Description -->
                        <VCol cols="12" md="6">
                            <VTextField v-model="file_description.value.value" label="File Description"
                                :error-messages="file_description.errorMessage.value" required />
                        </VCol>

                        <!-- Financial Value -->
                        <VCol cols="12" md="6">
                            <VTextField v-model="financialValue" label="Financial Value" type="number" />
                        </VCol>

                        <!-- File Expiry Date -->
                        <VCol cols="12" md="6">
                            <VTextField v-model="fileExperyDate" label="File Expiry Date" type="date" />
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
