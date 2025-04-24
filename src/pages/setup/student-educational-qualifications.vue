<template>
    <v-container class="pa-6" max-width="md">
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
            <v-tab :to="{ name: 'about-us' }" :disabled="!formStatus.programChoices">
                <v-icon start>mdi-information-outline</v-icon>
                About Us
                <v-icon v-if="formStatus.aboutUs" end color="green">mdi-check-circle</v-icon>
            </v-tab>

            <v-tab :to="{ name: 'documents' }" :disabled="!formStatus.aboutUs">
                <v-icon start>mdi-file-document</v-icon>
                Documents Attached
                <v-icon v-if="formStatus.documents" end color="green">mdi-check-circle</v-icon>
            </v-tab>
        </v-tabs>
        <v-card elevation="2">
            <v-card-title class="text-h6 font-weight-bold">
                First / Highest Qualification
            </v-card-title>

            <v-card-text>
                <v-form @submit.prevent="submitForm" ref="formRef">
                    <v-row dense>
                        <!-- Country -->
                        <v-col cols="12" md="6">
                            <v-select v-model="form.country_id" :items="countries" item-title="name" item-value="id"
                                label="Country of Institution" :loading="loadingCountries" :disabled="loadingCountries"
                                required />
                        </v-col>

                        <!-- Qualification Obtained and Grade -->
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.qualification_obtained" label="Qualification Obtained "
                                required />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.qualification_name" label="Qualification Name " required />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.grade" label="Grade " required />
                        </v-col>

                        <!-- Institution Name -->
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.institution_name" label="Institution / School Name" required />
                        </v-col>

                        <!-- Year Started -->
                        <v-col cols="12" md="6">
                            <v-select v-model="form.year_started_id" :items="years" item-title="name" item-value="id"
                                label="Year Started" :loading="loadingYears" :disabled="loadingYears" required />
                        </v-col>

                        <!-- Is Completed -->
                        <v-col cols="12" md="6">
                            <v-select v-model="form.is_completed" :items="completionOptions"
                                label="Is Qualification Completed?" required />
                        </v-col>

                        <!-- Qualification Order -->
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.qualification_order"
                                label="Qualification Order (e.g. 1 for first)" type="number" required />
                        </v-col>
                    </v-row>

                    <v-card-actions class="mt-4">
                        <v-btn color="primary" variant="outlined" size="large" @click="goToPrevious">
                            <v-icon start>mdi-arrow-left</v-icon>
                            Previous
                        </v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" type="submit" size="large" :loading="submitting">
                            Save Form
                        </v-btn>
                        <v-btn color="success" size="large" @click="goToNext" :disabled="!formStatus.education">
                            Next Section
                            <v-icon end>mdi-arrow-right</v-icon>
                        </v-btn>
                    </v-card-actions>
                </v-form>
            </v-card-text>
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
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { makeApiCall } from '@/services/apiService';
import type { StudentEducationalQualification, Country, Year } from '@/types/globalTypes';

const router = useRouter();
const route = useRoute();
const formRef = ref();
const activeTab = ref(2); // Index for the current tab (educational qualifications)
const submitting = ref(false);

// Get personalInformationId from route params or use a default
const personalInformationId = route.params.personalInformationId || 1;
console.log('Using personalInformationId:', personalInformationId);

const form = ref<StudentEducationalQualification>({
    personal_information_id: personalInformationId as number, // Use personalInformationId as the foreign key
    qualification_name: '',
    qualification_obtained: '',
    grade: '',
    country_id: null,
    institution_name: '',
    year_started_id: null,
    qualification_order: 1,
    is_completed: true,
});

const formStatus = reactive({
    personalInfo: false,
    emergencyContact: false,
    education: false,
    programChoices: false,
    aboutUs: false,
    documents: false,
});

const countries = ref<Country[]>([]);
const loadingCountries = ref(false);
const years = ref<Year[]>([]);
const loadingYears = ref(false);

const completionOptions = ref([
    { title: 'Yes', value: true },
    { title: 'No', value: false },
]);

const snackbar = reactive({
    show: false,
    text: '',
    color: 'info'
});

const fetchCountries = async () => {
    loadingCountries.value = true;
    try {
        const response = await makeApiCall<Country[]>('GET', '/countries');
        countries.value = response.data;
    } catch (error) {
        console.error('Error fetching countries:', error);
        showSnackbar('Failed to load countries', 'error');
    } finally {
        loadingCountries.value = false;
    }
};

const fetchYears = async () => {
    loadingYears.value = true;
    try {
        const response = await makeApiCall<Year[]>('GET', '/years');
        years.value = response.data;
    } catch (error) {
        console.error('Error fetching years:', error);
        showSnackbar('Failed to load years', 'error');

    } finally {
        loadingYears.value = false;
    }
};

const fetchEducationalQualification = async () => {
    try {
        // Use the correct API endpoint based on your route definitions
        const response = await makeApiCall<StudentEducationalQualification[]>(
            'GET',
            `/personal-information/${personalInformationId}/educational-qualifications`
        );

        if (response.data && response.data.length > 0) {
            form.value = response.data[0];
            formStatus.education = true;
        }
    } catch (error) {
        console.error('Error fetching educational qualification:', error);
        // Don't show a snackbar for this - it might be a new user with no records yet
    }
};

const checkFormStatus = async () => {
    try {
        // Check personal info - assuming this is always true if we're on this page
        formStatus.personalInfo = true;

        // Check emergency contact
        try {
            const emergencyContactResponse = await makeApiCall(
                'GET',
                `/personal-information/${personalInformationId}/emergency-contacts`
            );
            formStatus.emergencyContact = emergencyContactResponse.data && emergencyContactResponse.data.length > 0;
        } catch (e) {
            formStatus.emergencyContact = false;
        }

        // Education status will be set when we fetch the education data

        // For other sections, you'd implement similar checks based on your API structure
    } catch (error) {
        console.error('Error checking form status:', error);
    }
};

onMounted(() => {
    Promise.all([
        fetchCountries(),
        fetchYears(),
        fetchEducationalQualification(),
        checkFormStatus()
    ]);
});

const submitForm = async () => {
    if (!formRef.value?.validate()) {
        showSnackbar('Please fill all required fields', 'error');
        return;
    }

    submitting.value = true;
    try {
        let response;

        // Ensure personal_information_id is set
        form.value.personal_information_id = personalInformationId as number;

        if (form.value.id) {
            // Update existing record
            response = await makeApiCall(
                'PUT',
                `/educational-qualifications/${form.value.id}`,
                form.value
            );
        } else {
            // Create new record
            response = await makeApiCall(
                'POST',
                `/personal-information/${personalInformationId}/educational-qualifications`,
                form.value
            );
            // If the response contains the new ID, update our form
            if (response.data?.id) {
                form.value.id = response.data.id;
            }
        }

        // Mark as complete
        if (form.value.id) {
            await makeApiCall('POST', `/educational-qualifications/${form.value.id}/complete`);
        }

        formStatus.education = true;
        showSnackbar('Educational qualification saved successfully!', 'success');
    } catch (error) {
        console.error('Error submitting form:', error);
        showSnackbar('Failed to save educational qualification', 'error');
    } finally {
        submitting.value = false;
    }
};

const goToPrevious = () => {
    router.push({ name: 'emergency-contact' });
};

const goToNext = () => {
    router.push({ name: 'student-program-choices' });
};

const showSnackbar = (text: string, color: string = 'info') => {
    snackbar.text = text;
    snackbar.color = color;
    snackbar.show = true;
    setTimeout(() => {
        snackbar.show = false;
    }, 5000);
};
</script>
