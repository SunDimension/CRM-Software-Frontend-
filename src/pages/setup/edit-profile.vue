<script setup lang="ts">
import { makeApiCall } from '@/services/apiService'; // adjust path as needed
import { Gender } from '@/types/globalTypes'; // adjust path as needed
import { onMounted, ref } from 'vue';

const profileForm = ref({
    name: '',
    gender_id: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    photo: null as File | null,
})

// Gender options from API
const genders = ref<Gender[]>([]);
const loading = ref(false);

async function fetchGenderOptions(): Promise<void> {
    loading.value = true;
    try {
        const response = await makeApiCall<Gender[]>('GET', '/genders');
        if (response.data) {
            genders.value = response.data;
        }
    } catch (error) {
        console.error(error);
        // Optionally show a snackbar error here
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchGenderOptions();
});

const handlePhotoUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        profileForm.value.photo = input.files[0];
    }
};

const handleSaveProfile = () => {
    console.log('Saving profile:', profileForm.value);
};

// Define validation rules
const rules = {
    required: (v: any) => !!v || 'This field is required'
};
</script>

<template>
    <VCol cols="12">
        <VCard title="Edit Profile">
            <VCardText>
                <VRow>
                    <!-- Left Column - Form Fields -->
                    <VCol cols="12" md="8">
                        <VForm>
                            <VTextField v-model="profileForm.name" label="Applicant Name" class="mb-4" />

                            <!-- v-select using gender_id -->
                            <v-select v-model="profileForm.gender_id" :items="genders" item-title="name" item-value="id"
                                label="Gender*" :rules="[rules.required]" :disabled="loading" class="mb-4" />


                            <VTextField v-model="profileForm.dateOfBirth" label="Date of Birth" type="date"
                                class="mb-4" />

                            <VTextField v-model="profileForm.phoneNumber" label="Phone Number" class="mb-4" />

                            <VTextField v-model="profileForm.email" label="Email Address" type="email" class="mb-4" />
                        </VForm>
                    </VCol>

                    <!-- Right Column - Photo Upload -->
                    <VCol cols="12" md="4">
                        <VBtn color="primary" block class="mb-4" @click="handleSaveProfile">
                            Save Profile
                        </VBtn>

                        <VCard class="mx-auto" max-width="300" elevation="2">
                            <VCardText class="text-center">
                                <VAvatar v-if="!profileForm.photo" size="200" color="grey-lighten-3" class="mb-4">
                                    <VIcon size="100" color="grey">
                                        ri-user-line
                                    </VIcon>
                                </VAvatar>

                                <VImg v-else :src="URL.createObjectURL(profileForm.photo)" max-width="200"
                                    class="mx-auto mb-4" />

                                <VBtn color="primary" variant="outlined" block @click="$refs.fileInput.click()">
                                    Upload Photo
                                </VBtn>

                                <input ref="fileInput" type="file" accept="image/*" style="display: none"
                                    @change="handlePhotoUpload" />
                            </VCardText>
                        </VCard>
                    </VCol>
                </VRow>
            </VCardText>
        </VCard>
    </VCol>
</template>
