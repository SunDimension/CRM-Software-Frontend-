<template>
    <v-container fluid>
        <!-- Logo and Title Section -->
        <v-row justify="center" class="mb-4">
            <v-col cols="12" md="6" class="text-center">
                <v-img src="/logo.jpg" alt="IEIS Logo" class="mx-auto mb-4" max-width="50"></v-img>
                <h1 class="text-h4 font-weight-bold text-center">APPLICATION FORM</h1>
                <div v-if="form.id" class="mt-2">
                    <span class="text-subtitle-1">Application ID: {{ form.id }}</span>
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

            <v-tab :to="{ name: 'emergency-contact' }" :disabled="!formStatus.personalInfo">
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

            <v-form ref="formRef" v-model="valid" @submit.prevent="savePersonalInfo">
                <!-- Student Name -->
                <v-text-field v-model="form.student_name" label="Student Name*"
                    placeholder="Surname, Firstname Middlename" :rules="[rules.required]" outlined density="compact"
                    :disabled="loading"></v-text-field>

                <!-- Sex, DOB, Marital Status -->
                <v-row class="pt-5">
                    <v-col cols="12" md="4">
                        <v-select v-model="form.gender_id" :items="genders" item-title="name" item-value="id"
                            label="Gender*" outlined density="compact" :rules="[rules.required]" :disabled="loading" />
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-text-field v-model="form.date_of_birth" label="Date of Birth*" type="date"
                            :rules="[rules.required]" :disabled="loading" density="compact" outlined />
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-select v-model="form.marital_status_id" :items="maritalStatuses" item-title="name"
                            item-value="id" label="Marital Status*" outlined density="compact" :rules="[rules.required]"
                            :disabled="loading"></v-select>
                    </v-col>
                </v-row>

                <!-- Phone and Email -->
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.phone_number" label="Phone Number*" outlined density="compact"
                            :rules="[rules.required, rules.phone]" :disabled="loading"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.email" label="Email Address*" outlined density="compact"
                            :rules="[rules.required, rules.email]" type="email" :disabled="loading"></v-text-field>
                    </v-col>
                </v-row>

                <!-- Father's and Mother's Names -->
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.father_name" label="Father's Name*" outlined density="compact"
                            :rules="[rules.required]" :disabled="loading"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.mother_name" label="Mother's Name*" outlined density="compact"
                            :rules="[rules.required]" :disabled="loading"></v-text-field>
                    </v-col>
                </v-row>

                <!-- Passport Information -->
                <v-row>
                    <v-col cols="12" md="4">
                        <v-text-field v-model="form.passport_number" label="Passport Number" outlined density="compact"
                            :disabled="loading" />
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-text-field v-model="form.passport_issued_date" label="Issued Date" type="date" outlined
                            density="compact" :max="new Date().toISOString().split('T')[0]" :disabled="loading" />
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-text-field v-model="form.passport_expiry_date" label="Expiry Date" type="date" outlined
                            density="compact" :min="form.passport_issued_date" :disabled="loading" />
                    </v-col>
                </v-row>

                <!-- Postal Address -->
                <v-textarea class="pt-5" v-model="form.postal_address" label="Postal Address*" outlined
                    density="compact" :rules="[rules.required]" :disabled="loading"></v-textarea>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" size="large" type="submit" :disabled="!isFormFilled || loading"
                        :loading="loading">
                        Save Form
                    </v-btn>

                    <v-btn color="success" size="large" :disabled="!formStatus.personalInfo || loading"
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
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { StudentPersonalInformation, Gender, MaritalStatus, SnackbarState } from '@/types/globalTypes';
import { makeApiCall } from '@/services/apiService';
import { number } from 'yup';
const router = useRouter();
const form = ref<StudentPersonalInformation>({
    id: null,
    student_name: '',
    gender_id: null,
    date_of_birth: '',
    phone_number: '',
    email: '',
    marital_status_id: null,
    father_name: '',
    mother_name: '',
    passport_number: '',
    passport_issued_date: '',
    passport_expiry_date: '',
    postal_address: '',
    is_completed: false
});

const valid = ref(false);
const loading = ref(false);
const activeTab = ref(0);
const genders = ref<Gender[]>([]);
const maritalStatuses = ref<MaritalStatus[]>([]);
const formRef = ref<any>(null);

// Initialize form status from localStorage or set default values
const formStatus = reactive({
    personalInfo: false,
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
    phone: (v: string) => /^[0-9+\s-]{10,15}$/.test(v) || 'Phone number must be valid'
};

// Check if all required fields are filled
const isFormFilled = computed(() => {
    return !!form.value.student_name &&
        !!form.value.gender_id &&
        !!form.value.date_of_birth &&
        !!form.value.marital_status_id &&
        !!form.value.phone_number &&
        !!form.value.email &&
        !!form.value.father_name &&
        !!form.value.mother_name &&
        !!form.value.postal_address;
});

onMounted(() => {
    fetchGenders();
    fetchMaritalStatuses();
    fetchUserData();
});

// Watch for changes in form.id and log it
watch(() => form.value.id, (newId) => {
    if (newId) {
        console.log('Personal Information ID:', newId);
    }
});

async function fetchGenders(): Promise<void> {
    loading.value = true;
    try {
        const response = await makeApiCall<Gender[]>('GET', '/genders');
        if (response.data) {
            genders.value = response.data;
        }
    } catch (error) {
        console.error(error);
        showSnackbar('Failed to load gender options', 'error');
    } finally {
        loading.value = false;
    }
}

async function fetchMaritalStatuses(): Promise<void> {
    loading.value = true;
    try {
        const response = await makeApiCall<MaritalStatus[]>('GET', '/marital-statuses');
        if (response.data) {
            maritalStatuses.value = response.data;
        }
    } catch (error) {
        console.error(error);
        showSnackbar('Failed to load marital status options', 'error');
    } finally {
        loading.value = false;
    }
}

const fetchUserData = async (): Promise<void> => {
    loading.value = true;
    try {
        const response = await makeApiCall<StudentPersonalInformation>('GET', '/personal-information');
        if (response.data) {
            const data = response.data;
            form.value = {
                ...data,
                gender_id: data.gender_id?.id || data.gender_id || null,
                marital_status_id: data.marital_status_id?.id || data.marital_status_id || null,
            };

            // Update form status based on the is_completed field
            formStatus.personalInfo = data.is_completed || false;
            if (formStatus.personalInfo) {
                localStorage.setItem('personalInfoCompleted', 'true');
            }

            // Log the personal information ID
            if (data.id) {
                console.log('Personal Information ID (from fetch):', data.id);
                localStorage.setItem('applicationId', data.id.toString());
            }
        }
    } catch (error) {
        console.error(error);
        showSnackbar('Failed to load your personal information', 'error');
    } finally {
        loading.value = false;
    }
}

async function savePersonalInfo(): Promise<void> {
    const { valid: isValid } = await formRef.value?.validate() || { valid: false };
    if (!isValid) return;

    loading.value = true;
    try {
        const formData = { ...form.value, is_completed: true };
        let response;

        if (form.value.id) {
            // Update existing record
            response = await makeApiCall('PUT', `/personal-information/${form.value.id}`, formData);
            await makeApiCall('POST', `/personal-information/${form.value.id}/complete`, {});
        } else {
            // Create new record
            response = await makeApiCall('POST', '/personal-information', formData);

            // If we get an ID back, update our form with it
            if (response.data && response.data.id) {
                form.value.id = response.data.id;
                localStorage.setItem('applicationId', response.data.id.toString());
                console.log('New Personal Information ID created:', response.data.id);

                // Mark as complete after creation
                await makeApiCall('POST', `/personal-information/${response.data.id}/complete`, {});
            }
        }

        // Update local form status
        form.value.is_completed = true;
        formStatus.personalInfo = true;
        localStorage.setItem('personalInfoCompleted', 'true');

        showSnackbar('Personal information saved successfully', 'success');

        // Fetch updated data to ensure we have the latest
        await fetchUserData();
    } catch (error: any) {
        console.error(error);
        let errorMessage = 'Failed to save personal information';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }
        showSnackbar(errorMessage, 'error');
    } finally {
        loading.value = false;
    }
}

function goToNextSection(): void {
    if (formStatus.personalInfo) {
        router.push({ name: 'emergency-contact' });
    }
}

function showSnackbar(text: string, color: string = 'info'): void {
    snackbar.text = text;
    snackbar.color = color;
    snackbar.show = true;
    setTimeout(() => {
        snackbar.show = false;
    }, 5000);
}

async function logout(): Promise<void> {
    loading.value = true;
    try {
        await makeApiCall('POST', '/logout');
        // Clear all form status from localStorage
        localStorage.removeItem('applicationId');
        localStorage.removeItem('personalInfoCompleted');
        localStorage.removeItem('emergencyContactCompleted');
        localStorage.removeItem('educationCompleted');
        localStorage.removeItem('programChoicesCompleted');
        localStorage.removeItem('aboutUsCompleted');
        localStorage.removeItem('documentsCompleted');
        window.location.href = '/login';
    } catch (error) {
        console.error(error);
        showSnackbar('Failed to logout', 'error');
    } finally {
        loading.value = false;
    }
}
</script>
