<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { GenericSetUp as Gs, PrimaryFolder, } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref, watch } from 'vue';

// Define props
const props = defineProps<{
    companies: Gs[];
    years: Gs[];
    mode: 'create' | 'edit';
    primaryFolder?: PrimaryFolder; // Optional prop for edit mode
}>();

const dialog = ref(false);
const apiError = ref<string | null>(null);
const emits = defineEmits(['primaryFolderCreated']);

const { handleSubmit } = useForm({
    validationSchema: {
        name(value: string) {
            if (value && value.trim() !== '') return true;
            return 'Folder Name is required.';
        },

    },
});

// Fields
const name = useField('name');
const company_id = useField('company');
const year_id = useField('year');

const selectedCompany = ref<Gs | null>(null);
const selectedYear = ref<Gs | null>(null);

const loading = ref(false);

// Load data for edit mode if necessary
const loadDataForEdit = () => {
    if (props.mode === 'edit' && props.primaryFolder) {
        name.value.value = props.primaryFolder.name;
        selectedCompany.value = props.companies.find(c => c.id === props.primaryFolder?.company_id) ?? null;
        selectedYear.value = props.years.find(y => y.id === props.primaryFolder?.year_id) ?? null;
    }
};


// Watch for changes in props to update form data
watch(() => props.primaryFolder, loadDataForEdit, { immediate: true });

const handleOptionSelected = (value: Gs, label: string) => {
    if (label === 'Company') {
        selectedCompany.value = value;
    } else if (label === 'Year') {
        selectedYear.value = value;
    }
};


const submit = handleSubmit((values) => {
    loading.value = true;
    apiError.value = null;

    const formData: PrimaryFolder = {
        name: values.name,
        company_id: selectedCompany.value?.id ?? 0,
        year_id: selectedYear.value?.id ?? 0,
    };

    const apiMethod = props.mode === 'edit' ? 'PUT' : 'POST';
    const apiUrl = props.mode === 'edit' ? `/primary-folders/${props.primaryFolder?.id}` : `/primary-folders`;

    makeApiCall<PrimaryFolder>(apiMethod, apiUrl, formData)
        .then(() => {
            emits('primaryFolderCreated');
            dialog.value = false;
        })
        .catch(() => {
            apiError.value = "An unexpected error occurred.";
        })
        .finally(() => {
            loading.value = false;
        });
});
</script>

<template>
    <div class="pa-4 text-center">
        <v-dialog v-model="dialog" max-width="800">
            <template v-slot:activator="{ props: activatorProps }">
                <v-btn v-if="mode === 'create'" class="text-none font-weight-regular" color="success-darken-1"
                    :text="`Create Primary Folder`" variant="tonal" v-bind="activatorProps"></v-btn>
                <v-btn v-if="mode === 'edit'" v-bind="activatorProps" variant="plain" color="pending">
                    <VIcon icon="ri-edit-line" color="warning" />
                </v-btn>
            </template>

            <v-card :title="mode === 'edit' ? 'Edit Folder' : 'Create Folder'">
                <v-card-text>
                    <form @submit.prevent="submit">
                        <v-container fluid>
                            <v-row>
                                                 <v-col cols="12" sm="6" md="4">
                                    <filterSelect :genericOptions="companies" :label_cus="'Company*'"
                                        @optionSelected="(item) => handleOptionSelected(item, 'Company')"
                                        v-model="selectedCompany" />
                                </v-col>

                                <v-col cols="12" sm="6" md="4">
                                    <filterSelect :genericOptions="years" :label_cus="'Year*'"
                                        @optionSelected="(item) => handleOptionSelected(item, 'Year')"
                                        v-model="selectedYear" />
                                </v-col>
                                <v-col cols="12" sm="6" md="4">
                                    <v-text-field v-model="name.value.value" :error-messages="name.errorMessage.value"
                                        label="Folder Name*" required></v-text-field>
                                </v-col>

                                 <!-- <v-col cols="12" sm="6" md="4"> -->
                                    <!-- <v-select :items="companies" item-title="name" item-value="id"
                                        v-model="selectedCompany" label="Company*"></v-select>
                                </v-col>  -->
           
                            </v-row>
                        </v-container>

                        <!-- Error Message Display -->
                        <div v-if="apiError" class="text-error">
                            {{ apiError }}
                        </div>

                        <v-card-actions>
                            <v-spacer></v-spacer>

                            <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>

                            <v-btn color="success-darken-1" type="submit"
                                :text="mode === 'edit' ? 'Update Folder' : 'Create Folder'" variant="tonal"
                                :loading="loading">
                                <template #loader>
                                    <v-progress-circular indeterminate size="24" class="mr-2" />
                                </template>
                            </v-btn>
                        </v-card-actions>
                    </form>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>
