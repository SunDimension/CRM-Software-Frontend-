<template>
    <v-container class="pa-6" max-width="md">
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

        <!-- Qualifications Section -->
        <v-card elevation="2" class="mb-6">
            <v-card-title class="text-h6 font-weight-bold">
                Educational Qualifications
            </v-card-title>

            <v-card-text>
                <!-- First Qualification -->
                <v-form @submit.prevent="submitForm" ref="formRef">
                    <v-row dense>
                        <v-col cols="12">
                            <h3 class="text-h6 font-weight-bold">First / Highest Qualification Obtained</h3>
                        </v-col>
                        <!-- Country -->
                        <v-col cols="12" md="6">
                            <v-select v-model="form.country_id" :items="countries" item-title="name" item-value="id"
                                label="Country of Institution" :loading="loadingCountries" :disabled="loadingCountries"
                                required />
                        </v-col>

                        <!-- Qualification Obtained and Grade -->
                        <v-col cols="12" md="6">
                            <v-select v-model="form.qualification_obtained_id" :items="qualifications" item-title="name"
                                item-value="id" label="Qualification Obtained" :loading="loadingQualifications"
                                :disabled="loadingQualifications" required />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="form.grade" label="Grade" required />
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

                        <!-- Year Finished -->
                        <v-col cols="12" md="6">
                            <v-select v-model="form.year_finished_id" :items="years" item-title="name" item-value="id"
                                label="Year Finished" :loading="loadingYears" :disabled="loadingYears" required />
                        </v-col>

                        <!-- No individual save button here -->
                    </v-row>
                </v-form>

                <!-- Second Qualification -->
                <v-form @submit.prevent="submitSecondQualification" ref="secondFormRef" class="mt-6">
                    <v-row dense>
                        <v-col cols="12">
                            <h3 class="text-h6 font-weight-bold">Second Qualification Obtained</h3>
                        </v-col>
                        <!-- Country -->
                        <v-col cols="12" md="6">
                            <v-select v-model="secondForm.country_id" :items="countries" item-title="name"
                                item-value="id" label="Country of Institution" :loading="loadingCountries"
                                :disabled="loadingCountries" required />
                        </v-col>

                        <!-- Qualification Obtained and Grade -->
                        <v-col cols="12" md="6">
                            <v-select v-model="secondForm.qualification_obtained_id" :items="qualifications"
                                item-title="name" item-value="id" label="Qualification Obtained"
                                :loading="loadingQualifications" :disabled="loadingQualifications" required />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="secondForm.grade" label="Grade" required />
                        </v-col>

                        <!-- Institution Name -->
                        <v-col cols="12" md="6">
                            <v-text-field v-model="secondForm.institution_name" label="Institution / School Name"
                                required />
                        </v-col>

                        <!-- Year Started -->
                        <v-col cols="12" md="6">
                            <v-select v-model="secondForm.year_started_id" :items="years" item-title="name"
                                item-value="id" label="Year Started" :loading="loadingYears" :disabled="loadingYears"
                                required />
                        </v-col>

                        <!-- Year Finished -->
                        <v-col cols="12" md="6">
                            <v-select v-model="secondForm.year_finished_id" :items="years" item-title="name"
                                item-value="id" label="Year Finished" :loading="loadingYears" :disabled="loadingYears"
                                required />
                        </v-col>

                        <!-- No individual save button here -->
                    </v-row>
                </v-form>

                <!-- Third Qualification -->
                <v-form @submit.prevent="submitThirdQualification" ref="thirdFormRef" class="mt-6">
                    <v-row dense>
                        <v-col cols="12">
                            <h3 class="text-h6 font-weight-bold">Third Qualification Obtained</h3>
                        </v-col>
                        <!-- Country -->
                        <v-col cols="12" md="6">
                            <v-select v-model="thirdForm.country_id" :items="countries" item-title="name"
                                item-value="id" label="Country of Institution" :loading="loadingCountries"
                                :disabled="loadingCountries" required />
                        </v-col>

                        <!-- Qualification Obtained and Grade -->
                        <v-col cols="12" md="6">
                            <v-select v-model="thirdForm.qualification_obtained_id" :items="qualifications"
                                item-title="name" item-value="id" label="Qualification Obtained"
                                :loading="loadingQualifications" :disabled="loadingQualifications" required />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="thirdForm.grade" label="Grade" required />
                        </v-col>

                        <!-- Institution Name -->
                        <v-col cols="12" md="6">
                            <v-text-field v-model="thirdForm.institution_name" label="Institution / School Name"
                                required />
                        </v-col>

                        <!-- Year Started -->
                        <v-col cols="12" md="6">
                            <v-select v-model="thirdForm.year_started_id" :items="years" item-title="name"
                                item-value="id" label="Year Started" :loading="loadingYears" :disabled="loadingYears"
                                required />
                        </v-col>

                        <!-- Year Finished -->
                        <v-col cols="12" md="6">
                            <v-select v-model="thirdForm.year_finished_id" :items="years" item-title="name"
                                item-value="id" label="Year Finished" :loading="loadingYears" :disabled="loadingYears"
                                required />
                        </v-col>

                        <!-- No individual save button here -->
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>

        <v-card-actions class="mt-4">
            <v-btn color="primary" variant="outlined" size="large" @click="goToPrevious">
                <v-icon start>mdi-arrow-left</v-icon>
                Previous
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" size="large" @click="submitAllForms" :loading="submitting">
                Save All Qualifications
            </v-btn>
            <v-btn color="success" size="large" @click="goToNext" :disabled="!formStatus.education">
                Next Section
                <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
        </v-card-actions>

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
import type { Country, StudentEducationalQualification, Year } from '@/types/globalTypes';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const formRef = ref();
const secondFormRef = ref();
const thirdFormRef = ref();
const activeTab = ref(2); // Index for the current tab (educational qualifications)

// Track submission status for the entire form
const submitting = ref(false);

// Retrieve personalInformationId from localStorage
const personalInformationId = ref<number | null>(null);
const storedAppId = localStorage.getItem('applicationId');
if (storedAppId) {
    personalInformationId.value = parseInt(storedAppId);
    console.log('Using Personal Information ID:', personalInformationId.value);
} else {
    console.error('Personal Information ID not found in localStorage.');
    router.push({ name: 'personal-information-form' });
}

// First Qualification Form
const form = reactive<StudentEducationalQualification>({
    personal_information_id: personalInformationId.value as number,
    qualification_name: '',
    qualification_obtained_id: null,
    grade: '',
    country_id: null,
    institution_name: '',
    year_started_id: null,
    year_finished_id: null,
    qualification_order: 1,
    is_completed: true,
});

// Second Qualification Form
const secondForm = reactive<StudentEducationalQualification>({
    personal_information_id: personalInformationId.value as number,
    qualification_name: '',
    qualification_obtained_id: null, // Use qualification_obtained_id
    grade: '',
    country_id: null,
    institution_name: '',
    year_started_id: null,
    year_finished_id: null,
    qualification_order: 2,
    is_completed: true,
});

// Third Qualification Form
const thirdForm = reactive<StudentEducationalQualification>({
    personal_information_id: personalInformationId.value as number,
    qualification_name: '',
    qualification_obtained_id: null, // Use qualification_obtained_id
    grade: '',
    country_id: null,
    institution_name: '',
    year_started_id: null,
    year_finished_id: null,
    qualification_order: 3,
    is_completed: true,
});

// Other reactive variables
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
const qualifications = ref([]);
const loadingQualifications = ref(false);

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

const fetchQualifications = async () => {
    loadingQualifications.value = true;
    try {
        const response = await makeApiCall('GET', '/level-of-study');
        qualifications.value = response.data;
    } catch (error) {
        console.error('Error fetching qualifications:', error);
        showSnackbar('Failed to load qualifications', 'error');
    } finally {
        loadingQualifications.value = false;
    }
};

const fetchEducationalQualification = async () => {
    if (!personalInformationId.value) {
        console.error('Application ID is missing.');
        return;
    }

    try {
        const response = await makeApiCall<StudentEducationalQualification[]>(
            'GET',
            `/personal-information/${personalInformationId.value}/educational-qualifications`
        );

        if (response.data && response.data.length > 0) {
            // Process and fill the forms based on the qualifications fetched
            response.data.forEach((qualification, index) => {
                if (index === 0) {
                    // First qualification
                    Object.keys(qualification).forEach(key => {
                        if (key in form) {
                            form[key] = qualification[key];
                        }
                    });
                } else if (index === 1) {
                    // Second qualification
                    Object.keys(qualification).forEach(key => {
                        if (key in secondForm) {
                            secondForm[key] = qualification[key];
                        }
                    });
                } else if (index === 2) {
                    // Third qualification
                    Object.keys(qualification).forEach(key => {
                        if (key in thirdForm) {
                            thirdForm[key] = qualification[key];
                        }
                    });
                }
            });

            // Mark education as complete if at least one qualification is saved
            formStatus.education = true;
        }
    } catch (error) {
        console.error('Error fetching educational qualification:', error);
    }
};

const checkFormStatus = async () => {
    if (!personalInformationId.value) {
        return;
    }

    try {
        formStatus.personalInfo = true;

        try {
            const emergencyContactResponse = await makeApiCall(
                'GET',
                `/personal-information/${personalInformationId.value}/emergency-contacts`
            );
            formStatus.emergencyContact = emergencyContactResponse.data && emergencyContactResponse.data.length > 0;
        } catch (e) {
            formStatus.emergencyContact = false;
        }
    } catch (error) {
        console.error('Error checking form status:', error);
    }
};

onMounted(() => {
    if (!personalInformationId.value) {
        showSnackbar('Personal Information ID not found. Please complete personal information first.', 'error');
        router.push({ name: 'personal-information-form' });
        return;
    }

    Promise.all([
        fetchCountries(),
        fetchYears(),
        fetchQualifications(),
        fetchEducationalQualification(),
        checkFormStatus()
    ]);
});

const submitForm = async () => {
    if (!formRef.value?.validate()) {
        showSnackbar('Please fill all required fields for the first qualification', 'error');
        return;
    }

    submitting.value = true;
    try {
        let response;

        // Ensure personal_information_id is set
        if (personalInformationId.value) {
            form.personal_information_id = personalInformationId.value;
        }

        if (form.id) {
            response = await makeApiCall(
                'PUT',
                `/educational-qualifications/${form.id}`,
                form
            );
        } else {
            response = await makeApiCall(
                'POST',
                `/personal-information/${personalInformationId.value}/educational-qualifications`,
                form
            );
            if (response.data?.id) {
                form.id = response.data.id;
            }
        }

        formStatus.education = true;
        showSnackbar('First educational qualification saved successfully!', 'success');
    } catch (error) {
        console.error('Error submitting form:', error);
        showSnackbar('Failed to save first educational qualification', 'error');
    } finally {
        submitting.value = false;
    }
};

const submitSecondQualification = async () => {
    if (!secondFormRef.value?.validate()) {
        showSnackbar('Please fill all required fields for the second qualification', 'error');
        return;
    }

    submitting.value = true;
    try {
        let response;

        // Ensure personal_information_id is set
        if (personalInformationId.value) {
            secondForm.personal_information_id = personalInformationId.value;
        }

        if (secondForm.id) {
            response = await makeApiCall(
                'PUT',
                `/educational-qualifications/${secondForm.id}`,
                secondForm
            );
        } else {
            response = await makeApiCall(
                'POST',
                `/personal-information/${personalInformationId.value}/educational-qualifications`,
                secondForm
            );
            if (response.data?.id) {
                secondForm.id = response.data.id;
            }
        }

        formStatus.education = true;
        showSnackbar('Second educational qualification saved successfully!', 'success');
    } catch (error) {
        console.error('Error submitting second qualification:', error);
        showSnackbar('Failed to save second educational qualification', 'error');
    } finally {
        submitting.value = false;
    }
};

const submitThirdQualification = async () => {
    if (!thirdFormRef.value?.validate()) {
        showSnackbar('Please fill all required fields for the third qualification', 'error');
        return;
    }

    submitting.value = true;
    try {
        let response;

        // Ensure personal_information_id is set
        if (personalInformationId.value) {
            thirdForm.personal_information_id = personalInformationId.value;
        }

        if (thirdForm.id) {
            response = await makeApiCall(
                'PUT',
                `/educational-qualifications/${thirdForm.id}`,
                thirdForm
            );
        } else {
            response = await makeApiCall(
                'POST',
                `/personal-information/${personalInformationId.value}/educational-qualifications`,
                thirdForm
            );
            if (response.data?.id) {
                thirdForm.id = response.data.id;
            }
        }

        formStatus.education = true;
        showSnackbar('Third educational qualification saved successfully!', 'success');
    } catch (error) {
        console.error('Error submitting third qualification:', error);
        showSnackbar('Failed to save third educational qualification', 'error');
    } finally {
        submitting.value = false;
    }
};

const goToPrevious = () => {
    router.push({ name: 'emergency-contact' });
};

const submitAllForms = async () => {
    const qualifications = [];

    // Add first qualification if it has data
    if (form.institution_name || form.grade) {
        qualifications.push({
            qualification_name: form.qualification_name,
            country_id: form.country_id,
            qualification_obtained_id: form.qualification_obtained_id, // Correct field name
            grade: form.grade,
            institution_name: form.institution_name,
            year_started_id: form.year_started_id,
            year_finished_id: form.year_finished_id,
            qualification_order: 1,
            is_completed: true,
        });
    }

    // Add second qualification if it has data
    if (secondForm.institution_name || secondForm.grade) {
        qualifications.push({
            qualification_name: secondForm.qualification_name || 'Second Qualification',
            country_id: secondForm.country_id,
            qualification_obtained_id: secondForm.qualification_obtained_id, // Correct field name
            grade: secondForm.grade,
            institution_name: secondForm.institution_name,
            year_started_id: secondForm.year_started_id,
            year_finished_id: secondForm.year_finished_id,
            qualification_order: 2,
            is_completed: true,
        });
    }

    // Add third qualification if it has data
    if (thirdForm.institution_name || thirdForm.grade) {
        qualifications.push({
            qualification_name: thirdForm.qualification_name || 'Third Qualification',
            country_id: thirdForm.country_id,
            qualification_obtained_id: thirdForm.qualification_obtained_id, // Correct field name
            grade: thirdForm.grade,
            institution_name: thirdForm.institution_name,
            year_started_id: thirdForm.year_started_id,
            year_finished_id: thirdForm.year_finished_id,
            qualification_order: 3,
            is_completed: true,
        });
    }

    // Ensure at least one qualification is provided
    if (qualifications.length === 0) {
        showSnackbar('Please fill in at least one qualification', 'error');
        return;
    }

    submitting.value = true;

    try {
        const response = await makeApiCall('POST', `/personal-information/${personalInformationId.value}/educational-qualifications`, {
            qualifications,
        });

        showSnackbar('Qualifications saved successfully!', 'success');
        formStatus.education = true;
    } catch (error) {
        console.error('Error submitting qualifications:', error);
        showSnackbar('Failed to save qualifications', 'error');
    } finally {
        submitting.value = false;
    }
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
