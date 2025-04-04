<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { useField, useForm } from 'vee-validate';
import { computed, ref } from 'vue';

// Reactive state
const dialog = ref(false);
const apiError = ref<string | null>(null);
const uploading = ref(false);
const fileInput = ref<File[] | undefined>(undefined);

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');

// Emits
const emits = defineEmits(['fileUploaded']);

// Form validation
const { handleSubmit, values } = useForm({
    validationSchema: {
        name(value: string) {
            return value && value.trim() !== '' ? true : 'File Name is required.';
        },
    },
});

const name = useField('name');

// Computed property for file selection
const isFileSelected = computed(() => !!fileInput.value);

// Handle file input change
const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    fileInput.value = target.files ? Array.from(target.files) : undefined;
};


// Show snackbar utility
const showSnackbar = (message: string, color: string) => {
    snackbarMessage.value = message;
    snackbarColor.value = color;
    snackbar.value = true;
};

// Handle form submission
const submit = handleSubmit(async () => {
    if (!fileInput.value || fileInput.value.length === 0) {
        showSnackbar('Please select a file before uploading.', 'error');
        return;
    }

    uploading.value = true;
    apiError.value = null;

    const formData = new FormData();
    formData.append('name', name.value.value as string);// Append the name field
    formData.append('file', fileInput.value[0], fileInput.value[0].name); // Append the first file in the array

    try {
        await makeApiCall('POST', '/files', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        showSnackbar('File uploaded successfully!', 'success');
        emits('fileUploaded');
        dialog.value = false;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'File upload failed. Please try again.';
        showSnackbar(errorMessage, 'error');
        apiError.value = JSON.stringify(error.response?.data || 'An unexpected error occurred.');
    } finally {
        uploading.value = false;
    }
});

</script>

<template>
    <div class="pa-4 text-center">
        <v-dialog v-model="dialog" max-width="800">
            <template v-slot:activator="{ props: activatorProps }">
                <v-btn class="text-none font-weight-regular" color="success-darken-1"
                    text="Upload File" variant="tonal" v-bind="activatorProps"></v-btn>
            </template>

            <v-card title="Upload File">
                <v-card-text>
                    <form @submit.prevent="submit">
                        <v-container fluid>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field v-model="name.value.value" 
                                        label="File Name*" required></v-text-field>
                                </v-col>

                                <v-col cols="12">
                                 <v-file-input 
    label="Choose file" 
    v-model="fileInput"
    @change="handleFileChange" 
    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" 
    show-size 
    required
/>

                                </v-col>
                            </v-row>
                        </v-container>

                        <div v-if="apiError" class="text-error">
                            {{ apiError }}
                        </div>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>
                            <v-btn color="success-darken-1" type="submit"
                                text="Upload File" variant="tonal"
                                :loading="uploading" :disabled="uploading">
                                <template #loader>
                                    <v-progress-circular indeterminate size="24" class="mr-2" />
                                </template>
                            </v-btn>
                        </v-card-actions>
                    </form>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
            {{ snackbarMessage }}
            <template v-slot:actions>
                <v-btn color="white" text="Close" @click="snackbar = false"></v-btn>
            </template>
        </v-snackbar>
    </div>
</template>
