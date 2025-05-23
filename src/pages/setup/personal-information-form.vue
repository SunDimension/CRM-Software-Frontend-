<template>
    <v-container fluid>
        <!-- Logo and Title Section -->
        <v-row justify="center" class="mb-4">
            <v-col cols="12" md="6" class="text-center">
                <v-img src="/ieisLogo.jpg" alt="IEIS Logo" class="mx-auto mb-4" max-width="50"></v-img>
                <h1 class="text-h4 font-weight-bold text-center">APPLICATION FORM</h1>
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
            <!-- Loading overlay -->
            <v-overlay :model-value="loading" absolute>
                <v-progress-circular indeterminate size="64"></v-progress-circular>
            </v-overlay>

            <v-form ref="formRef" v-model="valid" @submit.prevent="savePersonalInfo">
                <!-- Student Name -->
                <v-text-field v-model="form.student_name" label="Student Name"
                    placeholder="Surname, Firstname Middlename" :rules="[rules.required]" outlined density="compact"
                    :disabled="loading"></v-text-field>

                <!-- Sex, DOB, Marital Status -->
                <v-row class="pt-5">
                    <v-col cols="12" md="4">
                        <v-select v-model="form.gender_id" :items="genders" item-title="name" item-value="id"
                            label="Sex" outlined density="compact" :rules="[rules.required]" :disabled="loading" />
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-text-field v-model="form.date_of_birth" label="Date of Birth" type="date"
                            :rules="[rules.required]" :disabled="loading" density="compact" outlined />
                    </v-col>



                    <v-col cols="12" md="4">
                        <v-select v-model="form.marital_status_id" :items="maritalStatuses" item-title="name"
                            item-value="id" label="Marital Status" outlined density="compact" :rules="[rules.required]"
                            :disabled="loading"></v-select>
                    </v-col>
                </v-row>

                <!-- Phone and Email -->
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.phone_number" label="Phone Number" outlined density="compact"
                            :rules="[rules.required, rules.phone]" :disabled="loading"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.email" label="Email Address" outlined density="compact"
                            :rules="[rules.required, rules.email]" type="email" :disabled="loading"></v-text-field>
                    </v-col>
                </v-row>

                <!-- Father's and Mother's Names -->
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.father_name" label="Father's Name" outlined density="compact"
                            :rules="[rules.required]" :disabled="loading"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="form.mother_name" label="Mother's Name" outlined density="compact"
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
                <v-textarea class="pt-5" v-model="form.postal_address" label="Postal Address" outlined density="compact"
                    :rules="[rules.required]" :disabled="loading"></v-textarea>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" size="large" type="submit" :disabled="!valid || loading || formSaved"
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { StudentPersonalInformation } from '@/types/globalTypes';
import { makeApiCall } from '@/services/apiService';

interface Gender {
    id: number;
    name: string;
}

interface MaritalStatus {
    id: number;
    name: string;
}

interface SnackbarState {
    show: boolean;
    text: string;
    color: string;
}

const router = useRouter();
const form = ref<StudentPersonalInformation>({
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
const dateMenu = ref(false);
const issueDateMenu = ref(false);
const expiryDateMenu = ref(false);
const genders = ref<Gender[]>([]);
const maritalStatuses = ref<MaritalStatus[]>([]);
const formRef = ref<any>(null);

// Initialize form status
const formStatus = reactive({
    personalInfo: false,
    emergencyContact: false,
    education: false,
    programChoices: false,
    aboutUs: false,
    documents: false
});

const snackbar = reactive<SnackbarState>({
    show: false,
    text: '',
    color: ''
});

const rules = {
    required: (v: string) => !!v || 'This field is required',
    email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    phone: (v: string) => /^[0-9+\s-]{10,15}$/.test(v) || 'Phone number format is invalid'
};

const formattedDate = computed(() => {
    return form.value.date_of_birth ? new Date(form.value.date_of_birth).toLocaleDateString() : '';
});

const formattedIssueDate = computed(() => {
    return form.value.passport_issued_date ? new Date(form.value.passport_issued_date).toLocaleDateString() : '';
});

const formattedExpiryDate = computed(() => {
    return form.value.passport_expiry_date ? new Date(form.value.passport_expiry_date).toLocaleDateString() : '';
});

onMounted(() => {
    fetchGenders();
    fetchMaritalStatuses();
    fetchUserData();
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

            // Update form status based on the is_completed field from the response
            formStatus.personalInfo = data.is_completed || false;

            // Check the status of other forms if needed by calling respective APIs
            // For now, we only know the status of personal info
        }
    } catch (error) {
        console.error(error);
        showSnackbar('Failed to load your personal information', 'error');
    } finally {
        loading.value = false;
    }
}
const formSaved = ref(false); // Track whether form is saved

async function savePersonalInfo(): Promise<void> {
    const { valid: isValid } = await formRef.value?.validate() || { valid: false };
    if (!isValid) return;

    loading.value = true;
    try {
        const formData = { ...form.value, is_completed: true };

        if (form.value.id) {
            await makeApiCall('PUT', `/personal-information/${form.value.id}`, formData);
            await makeApiCall('POST', `/personal-information/${form.value.id}/complete`, {});
        } else {
            await makeApiCall('POST', '/personal-information', formData);
        }

        formStatus.personalInfo = true;
        formSaved.value = true; // ✅ Mark form as saved
        showSnackbar('Personal information saved successfully', 'success');
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

function dateSelected(): void {
    dateMenu.value = false;
}

async function logout(): Promise<void> {
    loading.value = true;
    try {
        await makeApiCall('POST', '/logout');
        window.location.href = '/login';
    } catch (error) {
        console.error(error);
        showSnackbar('Failed to logout', 'error');
    } finally {
        loading.value = false;
    }
}
</script>
