<template>
    <v-container>
        <v-row justify="center" class="mb-4">
            <v-col cols="12" md="6" class="text-center">
                <v-img src="/ieisLogo.jpg" alt="IEIS Logo" class="mx-auto mb-4" max-width="50"></v-img>
                <h1 class="text-h4 font-weight-bold text-center">APPLICATION FORM</h1>
            </v-col>
        </v-row>

        <v-tabs v-model="activeTab" background-color="primary" centered>
            <!-- Other Tabs -->
            <v-tab :to="{ name: 'about-us' }">
                <v-icon start>mdi-information-outline</v-icon>
                About Us
                <v-icon v-if="formStatus.aboutUs" end color="green">mdi-check-circle</v-icon>
            </v-tab>
        </v-tabs>

        <v-card class="mt-4 pa-6">
            <v-overlay :model-value="loading" absolute>
                <v-progress-circular indeterminate size="64" />
            </v-overlay>

            <v-form ref="formRef" v-model="valid" @submit.prevent="saveAboutUs">
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field label="How did you hear about us?" v-model="form.source" :rules="[rules.required]"
                            outlined density="compact" :disabled="loading" />
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field label="Referral Name (optional)" v-model="form.referral_name" outlined
                            density="compact" :disabled="loading" />
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field label="Guardian's Full Name" v-model="form.guardian_name"
                            :rules="[rules.required]" outlined density="compact" :disabled="loading" />
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field label="Guardian's Phone Number" v-model="form.guardian_phone"
                            :rules="[rules.required, rules.phone]" outlined density="compact" :disabled="loading" />
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-text-field label="Guardian's Email Address" v-model="form.guardian_email"
                            :rules="[rules.required, rules.email]" outlined density="compact" :disabled="loading" />
                    </v-col>
                </v-row>

                <v-card-actions>
                    <v-btn color="primary" variant="outlined" size="large" class="mr-2" @click="goBack"
                        :disabled="loading">
                        <v-icon start>mdi-arrow-left</v-icon>
                        Previous
                    </v-btn>
                    <v-spacer />
                    <v-btn color="primary" size="large" type="submit" :loading="loading" :disabled="!valid || loading">
                        Save Form
                    </v-btn>
                    <v-btn color="success" size="large" @click="goToNextSection" :disabled="loading">
                        Next Section
                        <v-icon end>mdi-arrow-right</v-icon>
                    </v-btn>
                </v-card-actions>
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
import { onMounted, ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { makeApiCall } from '@/services/apiService';

const route = useRoute();
const router = useRouter();
const formRef = ref(null);
const valid = ref(false);
const loading = ref(false);
const activeTab = ref(4); // Assuming this is the 5th tab

const personalInformationId = route.params.personalInformationId || 1;

const form = ref({
    student_id: 0,
    source: '',
    referral_name: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    is_completed: false,
});

const formStatus = reactive({
    aboutUs: false,
});

const snackbar = reactive({
    show: false,
    text: '',
    color: '',
});

const rules = {
    required: (v: string) => !!v || 'This field is required',
    email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    phone: (v: string) => /^[0-9+\s-]{10,15}$/.test(v) || 'Phone number format is invalid',
};

onMounted(() => {
    fetchAboutUs();
});

function fetchAboutUs() {
    loading.value = true;
    makeApiCall('GET', `/personal-information/${personalInformationId}/about-us`)
        .then((res) => {
            if (res.data) {
                form.value = { ...res.data, is_completed: res.data.is_completed || false };
                formStatus.aboutUs = form.value.is_completed;
            }
        })
        .catch((err) => {
            console.error(err);
            showSnackbar('Failed to load About Us information', 'error');
        })
        .finally(() => {
            loading.value = false;
        });
}

async function saveAboutUs() {
    const { valid: isValid } = await formRef.value?.validate() || { valid: false };
    if (!isValid) return;

    loading.value = true;
    const payload = { ...form.value, is_completed: true };

    try {
        if (form.value.id) {
            await makeApiCall('PUT', `/about-us/${form.value.id}`, payload);
        } else {
            const res = await makeApiCall('POST', `/personal-information/${personalInformationId}/about-us`, payload);
            if (res.data?.id) {
                form.value.id = res.data.id;
            }
        }
        formStatus.aboutUs = true;
        showSnackbar('About Us section saved successfully!', 'success');
    } catch (err) {
        console.error(err);
        showSnackbar('Error saving About Us section', 'error');
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

function showSnackbar(text: string, color = 'info') {
    snackbar.text = text;
    snackbar.color = color;
    snackbar.show = true;
    setTimeout(() => (snackbar.show = false), 5000);
}
</script>
