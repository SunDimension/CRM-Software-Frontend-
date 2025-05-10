<template>
    <v-container fluid>
        <!-- Logo and Title Section -->
        <v-row justify="center" class="mb-4">
            <v-col cols="12" md="6" class="text-center">
                <v-img src="/logo.jpg" alt="IEIS Logo" class="mx-auto mb-4" max-width="50"></v-img>
                <h1 class="text-h4 font-weight-bold text-center">APPLICATION FORM</h1>
                <div v-if="applicationId" class="mt-2">
                    <span class="text-subtitle-1">Application ID: {{ applicationId }}</span>
                </div>
            </v-col>
        </v-row>

        <!-- Form Tabs  -->
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

            <v-tab :to="{ name: 'student-educational-qualifications' }" :disabled="!formStatus.emergencyContact">
                <v-icon start>mdi-school</v-icon>
                Student Educational Qualification
                <v-icon v-if="formStatus.education" end color="green">mdi-check-circle</v-icon>
            </v-tab>

            <v-tab :to="{ name: 'student-program-choices' }" :disabled="!formStatus.education">
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

        <v-card class="mt-4 pa-6">
            <!-- Loading overlay -->
            <v-overlay :model-value="loading" absolute>
                <v-progress-circular indeterminate size="64"></v-progress-circular>
            </v-overlay>

            <v-form ref="formRef" v-model="valid" @submit.prevent="saveEmergencyContact">
                <!-- Emergency Contact Person Information -->
                <h2 class="text-h5 mb-4">Emergency Contact Person Information</h2>

                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.name" label="Contact Name*" :rules="[rules.required]" outlined
                            density="compact" :disabled="loading"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.relationship" label="Relationship to Student*"
                            :rules="[rules.required]" outlined density="compact" :disabled="loading"></v-text-field>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.phone_number" label="Phone Number*"
                            :rules="[rules.required, rules.phone]" outlined density="compact"
                            :disabled="loading"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.email" label="Email Address*" :rules="[rules.required, rules.email]"
                            outlined density="compact" type="email" :disabled="loading"></v-text-field>
                    </v-col>
                </v-row>

                <v-card-actions class="mt-4">
                    <v-btn color="primary" variant="outlined" size="large" @click="goBack" :disabled="loading">
                        <v-icon start>mdi-arrow-left</v-icon>
                        Previous
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" size="large" type="submit" :disabled="!isFormFilled || loading"
                        :loading="loading">
                        Save Form
                    </v-btn>
                    <v-btn color="success" size="large" :disabled="!formStatus.emergencyContact || loading"
                        @click="goToNextSection">
                        Next Section
                        <v-icon end>mdi-arrow-right</v-icon>
                    </v-btn>
                </v-card-actions>
            </v-form>
        </v-card>

        <!-- Snackbar for notifications -->
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
import { EmergencyContact, Country, Relationship, SnackbarState } from '@/types/globalTypes'
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';





const router = useRouter();
const applicationId = ref<number | null>(null);
const form = ref<EmergencyContact>({
    student_id: null,
    name: '',
    relationship: '',
    phone_number: '',
    email: '',
    is_completed: false
});

const valid = ref(false);
const loading = ref(false);
const activeTab = ref(1); // Emergency contact is the second tab (index 1)
const countries = ref<Country[]>([]);
const formRef = ref<any>(null);

// Initialize form status from localStorage
const formStatus = reactive({
    personalInfo: localStorage.getItem('personalInfoCompleted') === 'true',
    emergencyContact: localStorage.getItem('emergencyContactCompleted') === 'true',
    education: localStorage.getItem('educationCompleted') === 'true',
    programChoices: localStorage.getItem('programChoicesCompleted') === 'true',
    aboutUs: localStorage.getItem('aboutUsCompleted') === 'true',
    documents: localStorage.getItem('documentsCompleted') === 'true'
});

const snackbar = reactive<SnackbarState>({
    show: false,
    text: '',
    color: ''
});

const rules = {
    required: (v: string) => !!v || 'This field is required',
    email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    phone: (v: string) => !v || /^[0-9+\s-]{10,15}$/.test(v) || 'Phone number must be valid'
};

// Check if all required fields are filled
const isFormFilled = computed(() => {
    return !!form.value.name &&
        !!form.value.relationship &&
        !!form.value.phone_number &&
        !!form.value.email;
});

onMounted(async () => {
    await fetchEmergencyContact();
});

onMounted(async () => {
    // Get the personal information ID from localStorage
    const storedAppId = localStorage.getItem('applicationId');
    if (storedAppId) {
        applicationId.value = parseInt(storedAppId);
        form.value.student_id = parseInt(storedAppId);
        console.log('Using Personal Information ID:', applicationId.value);
    } else {
        showSnackbar('Personal information not found. Please complete personal information first.', 'error');
        router.push({ name: 'personal-information-form' });
        return;
    }

    // Check if personal info is completed first
    if (!formStatus.personalInfo) {
        showSnackbar('Please complete personal information first', 'warning');
        router.push({ name: 'personal-information-form' });
        return;
    }

    try {
        // Load data with a small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 50));
        await fetchCountries();
        await fetchEmergencyContact();
        console.log('Form data after loading:', form.value);
    } catch (error) {
        console.error('Error during component initialization:', error);
    }
});

// Watch for changes in form.id and log it
watch(() => form.value.id, (newId) => {
    if (newId) {
        console.log('Emergency Contact ID:', newId);
    }
});

async function fetchCountries(): Promise<void> {
    loading.value = true;
    try {
        const response = await makeApiCall<Country[]>('GET', '/countries');
        if (response.data) {
            countries.value = response.data;
        }
    } catch (error) {
        console.error(error);
        showSnackbar('Failed to load country options', 'error');
    } finally {
        loading.value = false;
    }
}

const fetchEmergencyContact = async (): Promise<void> => {
    if (!applicationId.value) return;

    loading.value = true;
    try {
        const response = await makeApiCall<EmergencyContact[]>(
            'GET',
            `/personal-information/${applicationId.value}/emergency-contacts`
        );

        console.log('Fetched emergency contact data:', response.data);

        if (response.data && response.data.length > 0) {
            // Extract the first object from the array
            const contact = response.data[0];

            // Map the data to the form object
            form.value = {
                id: contact.id,
                student_id: applicationId.value,
                name: contact.name || '',
                relationship: contact.relationship || '',
                phone_number: contact.phone_number || '',
                email: contact.email || '',
                is_completed: contact.is_completed || false
            };

            // Update form status
            formStatus.emergencyContact = contact.is_completed || false;
            if (formStatus.emergencyContact) {
                localStorage.setItem('emergencyContactCompleted', 'true');
            }

            console.log('Mapped form data:', form.value);
        } else {
            console.log('No emergency contact data found.');
        }
    } catch (error: any) {
        console.error('Error fetching emergency contact:', error);
        if (error.response?.status !== 404) {
            showSnackbar('Failed to load emergency contact information', 'error');
        }
    } finally {
        loading.value = false;
    }
};

async function saveEmergencyContact(): Promise<void> {
    const { valid: isValid } = await formRef.value?.validate() || { valid: false };
    if (!isValid || !applicationId.value) return;

    loading.value = true;
    try {
        const formData = {
            ...form.value,
            student_id: applicationId.value,
            is_completed: true
        };

        console.log('Submitting emergency contact data:', formData);

        let response;
        if (form.value.id) {
            // Update existing record
            response = await makeApiCall(
                'PUT',
                `/emergency-contacts/${form.value.id}`,
                formData
            );
            console.log('Updated emergency contact response:', response.data);

            // Mark as complete
            await makeApiCall('POST', `/emergency-contacts/${form.value.id}/complete`, {});
        } else {
            // Create new record
            response = await makeApiCall(
                'POST',
                `/personal-information/${applicationId.value}/emergency-contacts`,
                formData
            );
            console.log('Created emergency contact response:', response.data);

            // If we get an ID back, update our form with it
            if (response.data && response.data.id) {
                form.value.id = response.data.id;
                console.log('New Emergency Contact ID created:', response.data.id);

                // Mark as complete after creation
                await makeApiCall('POST', `/emergency-contacts/${response.data.id}/complete`, {});
            }
        }

        // Update local form status
        form.value.is_completed = true;
        formStatus.emergencyContact = true;
        localStorage.setItem('emergencyContactCompleted', 'true');

        showSnackbar('Emergency contact information saved successfully', 'success');

        // Fetch updated data to ensure we have the latest
        await fetchEmergencyContact();
    } catch (error: any) {
        console.error('Error saving emergency contact:', error);
        let errorMessage = 'Failed to save emergency contact information';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }
        showSnackbar(errorMessage, 'error');
    } finally {
        loading.value = false;
    }
}

function goToNextSection(): void {
    if (formStatus.emergencyContact) {
        router.push({ name: 'student-educational-qualifications' });
    }
}

function goBack(): void {
    router.push({ name: 'personal-information-form' });
}

function showSnackbar(text: string, color: string = 'info'): void {
    snackbar.text = text;
    snackbar.color = color;
    snackbar.show = true;
    setTimeout(() => {
        snackbar.show = false;
    }, 5000);
}
</script>
