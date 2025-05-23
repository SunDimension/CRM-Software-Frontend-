<template>
    <v-container>
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
                        <v-text-field label="Name of Referral" v-model="form.name_of_referal" density="compact" outlined
                            :disabled="loading" />
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field label="Where Did You Hear About Us?" v-model="form.where_did_you_hear_about_us"
                            density="compact" outlined :disabled="loading" />
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field label="Parent / Guardian" v-model="form.parent_guardian" density="compact"
                            outlined :disabled="loading" />
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field label="Government" v-model="form.government" density="compact" outlined
                            :disabled="loading" />
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field label="NGO" v-model="form.ngo" density="compact" outlined :disabled="loading" />
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field label="Self" v-model="form.self" density="compact" outlined :disabled="loading" />
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field label="Phone Number" v-model="form.phone_number" density="compact" outlined
                            :disabled="loading" :rules="[rules.phone]" />
                    </v-col>

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
                                :disabled="!formStatus.aboutUs || loading">
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
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { makeApiCall } from '@/services/apiService';
import { AboutUs } from '@/types/globalTypes';

const router = useRouter();
const route = useRoute();
const activeTab = ref(4); // Set to about us tab
const valid = ref(false);
const loading = ref(false);
const formRef = ref(null);

// Get personalInfoId from route params or query, fallback to 1
const personalInfoId = computed(() => {
    return Number(route.params.personalInfoId || route.query.personalInfoId || 1);
});

const form = ref<AboutUs>({
    student_id: String(personalInfoId.value), // Set student_id from personalInfoId
    name_of_referal: '',
    where_did_you_hear_about_us: '',
    parent_guardian: '',
    government: '',
    ngo: '',
    self: '',
    phone_number: '',
});

// Initialize form status locally
const formStatus = reactive({
    personalInfo: false,
    emergencyContact: false,
    education: false,
    programChoices: false,
    aboutUs: false,
    documents: false
});

const snackbar = reactive({
    show: false,
    text: '',
    color: ''
});

const rules = {
    required: (v: any) => !!v || 'This field is required',
    phone: (v: string) => !v || /^[0-9+\s-]{10,15}$/.test(v) || 'Phone number format is invalid'
};

onMounted(() => {
    fetchAboutUs();
});

function fetchAboutUs() {
    loading.value = true;
    console.log(`Fetching about us information for personal info ID: ${personalInfoId.value}`);

    makeApiCall(
        'GET',
        `/personal-information/${personalInfoId.value}/about-us`
    )
        .then(response => {
            console.log('About us fetch response:', response);
            if (response.data) {
                form.value = {
                    ...response.data,
                    is_completed: response.data.is_completed || false,
                    // Ensure student_id is set
                    student_id: response.data.student_id || String(personalInfoId.value)
                };
                formStatus.aboutUs = form.value.is_completed;
            }
        })
        .catch(error => {
            console.error('About us fetch error:', error);
            if (error.response) {
                console.error('Error status:', error.response.status);
                console.error('Error data:', error.response.data);
            }

            if (error.response && error.response.status !== 404) {
                showSnackbar('Failed to load About Us information', 'error');
            }
        })
        .finally(() => {
            loading.value = false;
        });
}

async function submit() {
    try {
        const { valid: isValid } = await formRef.value?.validate() || { valid: true }; // Make validation optional
        if (!isValid) return;

        loading.value = true;

        // Make sure student_id is properly set
        const formData: AboutUs = {
            ...form.value,
            student_id: form.value.student_id || String(personalInfoId.value),
            is_completed: true
        };

        console.log('Form data to be submitted:', formData);

        let response;

        if (form.value.id) {
            console.log(`Updating existing about-us record with ID: ${form.value.id}`);

            // Update existing record
            response = await makeApiCall(
                'PUT',
                `/about-us/${form.value.id}`,
                formData
            );

            console.log('Update response:', response);

            // Mark as complete
            const completeResponse = await makeApiCall(
                'POST',
                `/about-us/${form.value.id}/complete`
            );

            console.log('Mark as complete response:', completeResponse);
        } else {
            console.log(`Creating new about-us record for personal info ID: ${personalInfoId.value}`);

            // Create new record
            response = await makeApiCall(
                'POST',
                `/personal-information/${personalInfoId.value}/about-us`,
                formData
            );

            console.log('Create response:', response);

            // Update form with the newly created record ID
            if (response.data && response.data.id) {
                form.value.id = response.data.id;
            }
        }

        formStatus.aboutUs = true;
        showSnackbar('About Us information saved successfully!', 'success');
    } catch (error) {
        console.error('Submit error:', error);

        let errorMessage = 'Failed to save About Us information';

        if (error.response) {
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);

            if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            }

            // Check specific authorization errors
            if (error.response.status === 403 || error.response.status === 401) {
                console.error('Authorization error. Check user permissions and login status.');
                errorMessage = 'You are not authorized to perform this action. Please check your login status.';
            }
        }

        showSnackbar(errorMessage, 'error');
    } finally {
        loading.value = false;
    }
}

function goToNextSection() {
    if (formStatus.aboutUs) {
        router.push({ name: 'documents' });
    }
}

function goBack() {
    router.push({ name: 'student-program-choices' });
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
