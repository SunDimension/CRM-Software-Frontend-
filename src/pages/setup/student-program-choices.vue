<!-- views/StudentProgramChoices.vue -->
<template>
    <v-container>
        <v-row justify="center" class="mb-4">
            <v-col cols="12" md="6" class="text-center">
                <v-img src="/logo.jpg" alt="IEIS Logo" class="mx-auto mb-4" max-width="50"></v-img>
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
            <v-overlay :model-value="loading" class="align-center justify-center">
                <v-progress-circular indeterminate size="64"></v-progress-circular>
            </v-overlay>

            <v-form ref="formRef" v-model="valid" @submit.prevent="submit">
                <v-row>
                    <v-col cols="12" md="6">
                        <v-select :items="countries" item-title="name" item-value="id" label="Select Country"
                            v-model="form.country_id" :rules="[rules.required]" density="compact"
                            variant="outlined"></v-select>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-select :items="universities" item-title="name" item-value="id" label="Select University"
                            v-model="form.university_id" :rules="[rules.required]" density="compact"
                            variant="outlined"></v-select>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-select :items="programs" item-title="name" item-value="id" label="Select Program"
                            v-model="form.program_id" :rules="[rules.required]" density="compact"
                            variant="outlined"></v-select>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field label="First Choice" v-model="form.first_choice" :rules="[rules.required]"
                            density="compact" variant="outlined"></v-text-field>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field label="Second Choice" v-model="form.second_choice" :rules="[rules.required]"
                            density="compact" variant="outlined"></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field label="Third Choice" v-model="form.third_choice" :rules="[rules.required]"
                            density="compact" variant="outlined"></v-text-field>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12">
                        <v-card-actions>
                            <v-btn color="primary" variant="outlined" size="large" class="mr-2" @click="goBack"
                                :disabled="loading">
                                <v-icon start>mdi-arrow-left</v-icon>
                                Previous
                            </v-btn>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" size="large" type="submit" :loading="loading" :disabled="loading">
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

<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import type { GenericSetUp, ProgramChoice } from '@/types/globalTypes';
import type { AxiosRequestConfig } from 'axios';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

// Reference variables
const router = useRouter();
const formRef = ref(null);
const valid = ref(false);
const activeTab = ref(3); // Program choices is the 4th tab (0-indexed)
const loading = ref(false);

// Snackbar for notifications
const snackbar = reactive({
    show: false,
    text: '',
    color: 'info',
});

// Form status tracking
const formStatus = reactive({
    personalInfo: false,
    emergencyContact: false,
    education: false,
    programChoices: false,
    aboutUs: false,
    documents: false,
});

// Form data
const form = ref({
    id: null,
    country_id: null,
    university_id: null,
    program_id: null,
    first_choice: '',
    second_choice: '',
    third_choice: '',
    is_completed: false
});

// Get personal information ID from localStorage
const personalInformationId = ref<number | null>(null);
const storedAppId = localStorage.getItem('applicationId');
if (storedAppId) {
    personalInformationId.value = parseInt(storedAppId);
    console.log('Using Personal Information ID:', personalInformationId.value);
} else {
    console.error('Personal Information ID not found in localStorage.');
    router.push({ name: 'personal-information-form' });
}

// Validation rules
const rules = {
    required: (v: any) => !!v || 'This field is required',
};

// Other reactive variables
const countries = ref<GenericSetUp[]>([]);
const universities = ref<GenericSetUp[]>([]);
const programs = ref<GenericSetUp[]>([]);

// API functions
async function createProgramChoice(personalInformationId: number, programChoiceData: Partial<ProgramChoice>, config?: AxiosRequestConfig) {
    return makeApiCall<ProgramChoice>(
        'POST',
        `/personal-information/${personalInformationId}/program-choices`,
        programChoiceData,
        config
    );
}

async function updateProgramChoice(programChoiceId: number, programChoiceData: Partial<ProgramChoice>, config?: AxiosRequestConfig) {
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
        undefined,
        config,
    );
}

// Fetch data
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

async function fetchProgramChoices() {
    if (!personalInformationId.value) {
        console.error('No personal information ID provided');
        showSnackbar('Failed to load program choices: Missing personal information ID', 'error');
        return;
    }

    loading.value = true;
    try {
        // Fetch program choices for this personal information
        const response = await makeApiCall<ProgramChoice[]>(
            'GET',
            `/personal-information/${personalInformationId.value}/program-choices`
        );

        // If we have program choices data
        if (response.data && response.data.length > 0) {
            const programChoice = response.data[0]; // Get the first one

            // Update form with existing data
            form.value = {
                id: programChoice.id,
                country_id: programChoice.country_id,
                university_id: programChoice.university_id,
                program_id: programChoice.program_id,
                first_choice: programChoice.first_choice,
                second_choice: programChoice.second_choice,
                third_choice: programChoice.third_choice,
                is_completed: programChoice.is_completed || false
            };

            // Update form status based on is_completed
            formStatus.programChoices = programChoice.is_completed || false;
        }
    } catch (error) {
        console.error('Error fetching program choices:', error);
        showSnackbar('Failed to load program choices', 'error');
    } finally {
        loading.value = false;
    }
}

// Submit form
async function submit() {
    if (formRef.value) {
        const { valid: isValid } = await formRef.value.validate();
        if (!isValid) return;
    }

    loading.value = true;

    try {
        const formData = {
            country_id: form.value.country_id,
            university_id: form.value.university_id,
            program_id: form.value.program_id,
            first_choice: form.value.first_choice,
            second_choice: form.value.second_choice,
            third_choice: form.value.third_choice,
        };

        let response;

        if (form.value.id) {
            // Update existing record
            response = await updateProgramChoice(form.value.id, formData);
            showSnackbar('Program choices updated successfully!', 'success');
        } else {
            // Create new record
            if (!personalInformationId.value) {
                throw new Error('No personal information ID provided');
            }
            response = await createProgramChoice(personalInformationId.value, formData);
            form.value.id = response.data.id;
            showSnackbar('Program choices saved successfully!', 'success');
        }

        // Mark as complete
        await markProgramChoiceAsComplete(form.value.id);

        // Update status
        form.value.is_completed = true;
        formStatus.programChoices = true;
    } catch (error) {
        console.error('Error saving program choices:', error);
        showSnackbar('Failed to save program choices', 'error');
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

onMounted(async () => {
    loading.value = true;
    try {
        // Fetch all required data in parallel
        await Promise.all([
            fetchCountries(),
            fetchUniversities(),
            fetchPrograms(),
            fetchProgramChoices() // Fetch existing program choices
        ]);
    } catch (error) {
        console.error('Error during initialization:', error);
    } finally {
        loading.value = false;
    }
});
</script>
