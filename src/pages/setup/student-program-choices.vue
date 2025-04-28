<!-- views/StudentProgramChoices.vue -->
<template>
    <v-container>
        <v-row justify="center" class="mb-4">
            <v-col cols="12" md="6" class="text-center">
                <v-img src="/ieisLogo.jpg" alt="IEIS Logo" class="mx-auto mb-4" max-width="50"></v-img>
                <h1 class="text-h4 font-weight-bold text-center">APPLICATION FORM</h1>
            </v-col>
        </v-row>
        <v-tabs v-model="activeTab" background-color="primary" centered>
            <v-tab :to="{ name: 'personal-information-form' }">
                <v-icon start>mdi-account</v-icon>
                Personal Information
                <v-icon v-if="formStatus.personalInfo" end color="green">mdi-check-circle</v-icon>
            </v-tab>

            <v-tab :to="{ name: 'emergency-contact' }">
                <v-icon start>mdi-phone-alert</v-icon>
                Emergency Contact
                <v-icon v-if="formStatus.emergencyContact" end color="green">mdi-check-circle</v-icon>
            </v-tab>

            <v-tab :to="{ name: 'student-educational-qualifications' }">
                <v-icon start>mdi-school</v-icon>
                Student Educational Qualification
                <v-icon v-if="formStatus.education" end color="green">mdi-check-circle</v-icon>
            </v-tab>

            <v-tab :to="{ name: 'student-program-choices' }">
                <v-icon start>mdi-book-open-variant</v-icon>
                Program Choices
                <v-icon v-if="formStatus.programChoices" end color="green">mdi-check-circle</v-icon>
            </v-tab>
            <v-tab :to="{ name: 'about-us' }">
                <v-icon start>mdi-information-outline</v-icon>
                About Us
                <v-icon v-if="formStatus.aboutUs" end color="green">mdi-check-circle</v-icon>
            </v-tab>

            <v-tab :to="{ name: 'documents' }">
                <v-icon start>mdi-file-document</v-icon>
                Documents Attached
                <v-icon v-if="formStatus.documents" end color="green">mdi-check-circle</v-icon>
            </v-tab>
        </v-tabs>

        <v-card class="mt-4 pa-6">
            <v-overlay :model-value="loading" absolute>
                <v-progress-circular indeterminate size="64"></v-progress-circular>
            </v-overlay>

            <v-form ref="formRef" v-model="valid" @submit.prevent="submit">
                <v-row>
                    <v-col cols="12" md="6">
                        <v-select :items="countries" item-title="name" item-value="id" label="Select Country"
                            v-model="form.country_id" :rules="[rules.required]" density="compact" outlined></v-select>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-select :items="universities" item-title="name" item-value="id" label="Select University"
                            v-model="form.university_id" :rules="[rules.required]" density="compact"
                            outlined></v-select>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-select :items="programs" item-title="name" item-value="id" label="Select Program"
                            v-model="form.program_id" :rules="[rules.required]" density="compact" outlined></v-select>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field label="Priority" v-model="form.priority" type="number" :rules="[rules.required]"
                            density="compact" outlined></v-text-field>
                    </v-col>

                    <v-col cols="12">
                        <v-card-actions>
                            <v-btn color="primary" variant="outlined" size="large" class="mr-2" @click="goBack"
                                :disabled="loading">
                                <v-icon start>mdi-arrow-left</v-icon>
                                Previous
                            </v-btn>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" size="large" type="submit" :loading="loading"
                                :disabled="!valid || loading">
                                Save Form
                            </v-btn>
                            <v-btn color="success" size="large" @click="goToNextSection"
                                :disabled="!formStatus.programChoices || loading">
                                Next Section
                                <v-icon end>mdi-arrow-right</v-icon>
                            </v-btn>
                        </v-card-actions>
                    </v-col>
                </v-row>
            </v-form>
        </v-card>

        <v-snackbar v-model="snackbar.show" :color="snackbar.color">
            {{ snackbar.text }}
            <template v-slot:actions>
                <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { AxiosRequestConfig } from 'axios';
import { makeApiCall } from '@/services/apiService';
import type { GenericSetUp } from '@/types/globalTypes';
import type { ProgramChoice } from '@/types/globalTypes';
// Reference variables
const router = useRouter();
const route = useRoute();
const formRef = ref(null);
const valid = ref(false);
const activeTab = ref(3); // Program choices is the 4th tab (0-indexed)
const loading = ref(false);

// Form data
const form = ref<ProgramChoice>({
    country_id: null,
    university_id: null,
    program_id: null,
    priority: 1
});

// Data for dropdowns
const countries = ref<GenericSetUp[]>([]);
const universities = ref<GenericSetUp[]>([]);
const programs = ref<GenericSetUp[]>([]);

// Form status tracking
const formStatus = reactive({
    personalInfo: false,
    emergencyContact: false,
    education: false,
    programChoices: false,
    aboutUs: false,
    documents: false,
});

// Notifications
const snackbar = reactive({
    show: false,
    text: '',
    color: ''
});

// Validation rules
const rules = {
    required: (v: any) => !!v || 'This field is required',
};

// Get personal information ID from route params
const personalInformationId = Number(route.params.personalInformationId || 1);
console.log('Personal Information ID:', personalInformationId);
// API functions using makeApiCall
async function getProgramChoices(personalInformationId: number, config?: AxiosRequestConfig) {
    return makeApiCall<ProgramChoice[]>(
        'GET',
        `/personal-information/${personalInformationId}/program-choices`,
        undefined,
        config
    );
}

async function createProgramChoice(
    personalInformationId: number,
    programChoiceData: Partial<ProgramChoice>,
    config?: AxiosRequestConfig
) {
    return makeApiCall<ProgramChoice>(
        'POST',
        `/personal-information/${personalInformationId}/program-choices`,
        programChoiceData,
        config
    );
}

async function updateProgramChoice(
    programChoiceId: number,
    programChoiceData: Partial<ProgramChoice>,
    config?: AxiosRequestConfig
) {
    return makeApiCall<ProgramChoice>(
        'PUT',
        `/program-choices/${programChoiceId}`,
        programChoiceData,
        config
    );
}

async function markProgramChoiceAsComplete(programChoiceId: number, config?: AxiosRequestConfig) {
    return makeApiCall<ProgramChoice>(
        'POST',
        `/program-choices/${programChoiceId}/complete`,
        {},
        config
    );
}

// Function to check form statuses from individual endpoints instead of a single form-status endpoint
async function checkFormStatus() {
    try {
        // For each section, we'll check if it exists and is completed

        // 1. Personal Information - assume it's completed if we have the ID
        formStatus.personalInfo = !!personalInformationId;

        // 2. Emergency Contact - check if there's associated emergency contact
        try {
            const emergencyResponse = await makeApiCall('GET', `/personal-information/${personalInformationId}/emergency-contacts`);
            formStatus.emergencyContact = emergencyResponse.data && emergencyResponse.data.length > 0 &&
                emergencyResponse.data[0]?.is_completed;
        } catch (error) {
            console.error('Error checking emergency contact status:', error);
            formStatus.emergencyContact = false;
        }

        // 3. Educational Qualifications
        try {
            const educationResponse = await makeApiCall('GET', `/personal-information/${personalInformationId}/educational-qualifications`);
            formStatus.education = educationResponse.data && educationResponse.data.length > 0 &&
                educationResponse.data[0]?.is_completed;
        } catch (error) {
            console.error('Error checking education status:', error);
            formStatus.education = false;
        }

        // 4. Program Choices - will be set in fetchProgramChoice()

        // 5. About Us - Simple checked flag in localStorage if actual API doesn't exist
        formStatus.aboutUs = localStorage.getItem('aboutUsCompleted') === 'true';

        // 6. Documents
        try {
            const documentsResponse = await makeApiCall('GET', `/personal-information/${personalInformationId}/documents`);
            formStatus.documents = documentsResponse.data && documentsResponse.data.length > 0 &&
                documentsResponse.data[0]?.is_completed;
        } catch (error) {
            console.error('Error checking documents status:', error);
            formStatus.documents = false;
        }
    } catch (error) {
        console.error('Error checking form statuses:', error);
    }
}


onMounted(() => {
    Promise.all([
        fetchCountries(),
        fetchUniversities(),
        fetchPrograms()
    ]);
});
// Watch for changes in form.is_completed to update formStatus.programChoices
watch(() => form.value.is_completed, (newValue) => {
    formStatus.programChoices = !!newValue;
});

async function fetchCountries() {
    try {
        const response = await makeApiCall<GenericSetUp[]>('GET', '/countries');
        countries.value = response.data;
    } catch (error) {
        console.error('Error fetching countries:', error);
        showSnackbar('Failed to load countries', 'error');
    }
}

async function fetchUniversities() {
    try {
        const response = await makeApiCall<GenericSetUp[]>('GET', '/school');
        universities.value = response.data;
    } catch (error) {
        console.error('Error fetching universities:', error);
        showSnackbar('Failed to load universities', 'error');
    }
}

async function fetchPrograms() {
    try {
        const response = await makeApiCall<GenericSetUp[]>('GET', '/level-of-study');
        programs.value = response.data;
    } catch (error) {
        console.error('Error fetching programs:', error);
        showSnackbar('Failed to load programs', 'error');
    }
}

async function fetchProgramChoice() {
    try {
        const response = await getProgramChoices(personalInformationId);
        const choices = response.data;

        if (choices && choices.length > 0) {
            const choice = choices[0];
            form.value = {
                id: choice.id,
                student_id: choice.student_id,
                country_id: choice.country_id,
                university_id: choice.university_id,
                program_id: choice.program_id,
                priority: choice.priority,
                is_completed: choice.is_completed
            };
            formStatus.programChoices = choice.is_completed || false;
        }
    } catch (error) {
        console.error('Error fetching program choice:', error);
        // Only show error if it's not a 404 (which could mean new form)
        if (error.response?.status !== 404) {
            showSnackbar('Failed to load program choice information', 'error');
        }
    }
}

async function submit() {
    if (formRef.value) {
        const { valid: isValid } = await formRef.value.validate();
        if (!isValid) return;
    }

    loading.value = true;

    try {
        // Prepare form data for submission
        const formData = {
            country_id: form.value.country_id,
            university_id: form.value.university_id,
            program_id: form.value.program_id,
            priority: form.value.priority
        };

        let response;

        if (form.value.id) {
            // Update existing program choice
            response = await updateProgramChoice(form.value.id, formData);
            // Mark as complete
            await markProgramChoiceAsComplete(form.value.id);
        } else {
            // Create new program choice
            response = await createProgramChoice(personalInformationId, formData);
            form.value.id = response.data.id;
            // Mark as complete
            await markProgramChoiceAsComplete(form.value.id);
        }

        // Update local state
        form.value.is_completed = true;
        formStatus.programChoices = true;

        showSnackbar('Program choice saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving program choice:', error);
        let errorMessage = 'Failed to save program choice';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }
        showSnackbar(errorMessage, 'error');
    } finally {
        loading.value = false;
    }
}

function goToNextSection() {
    if (formStatus.programChoices) {
        router.push({ name: 'about-us' });
    }
}

function goBack() {
    router.push({ name: 'student-educational-qualifications' });
}

function showSnackbar(text: string, color: string = 'info') {
    snackbar.text = text;
    snackbar.color = color;
    snackbar.show = true;
    setTimeout(() => {
        snackbar.show = false;
    }, 5000);
}
</script>
