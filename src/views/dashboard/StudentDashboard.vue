<script setup lang="ts">
import CardStatisticsVertical from '@core/components/cards/CardStatisticsVertical.vue'
import { ref } from 'vue'

// Application statistics data
const newApplications = {
    title: 'New Applications',
    color: 'primary',
    icon: 'ri-file-add-line',
    stats: '0',
    change: 0,
    subtitle: 'Today',
}

const pendingApplications = {
    title: 'Pending Applications',
    color: 'warning',
    icon: 'ri-time-line',
    stats: '0',
    change: 0,
    subtitle: 'Awaiting Review',
}

const approvedApplications = {
    title: 'Approved Applications',
    color: 'success',
    icon: 'ri-checkbox-circle-line',
    stats: '0',
    change: 0,
    subtitle: 'Successfully Approved',
}

const rejectedApplications = {
    title: 'Rejected Applications',
    color: 'error',
    icon: 'ri-close-circle-line',
    stats: '0',
    change: 0,
    subtitle: 'Not Approved',
}

// Table headers for application history
const applicationHeaders = [
    { title: 'S/N', key: 'sn' },
    { title: 'Application ID', key: 'id' },
    { title: 'Application Title', key: 'title' },
    { title: 'Student Name', key: 'studentName' },
    { title: 'Status', key: 'status' },
    { title: 'Date Created', key: 'createdAt' },
]

// Table headers for document list
const documentHeaders = [
    { title: 'S/N', key: 'sn' },
    { title: 'Document ID', key: 'id' },
    { title: 'Document Name', key: 'name' },
    { title: 'Document Type', key: 'type' },
    { title: 'Application ID', key: 'applicationId' },
    { title: 'Date Created', key: 'createdAt' },
]

// Sample data for the application history table
const applicationHistory = ref([
    {
        id: 'APP001',
        title: 'Scholarship Application',
        studentName: 'John Doe',
        status: 'Pending',
        createdAt: '2024-03-15',
    },
    {
        id: 'APP002',
        title: 'Course Registration',
        studentName: 'Jane Smith',
        status: 'Approved',
        createdAt: '2024-03-14',
    },
])

// Sample data for the document list table
const documentList = ref([
    {
        id: 'DOC001',
        name: 'Transcript',
        type: 'Academic',
        applicationId: 'APP001',
        createdAt: '2024-03-15',
    },
    {
        id: 'DOC002',
        name: 'Recommendation Letter',
        type: 'Reference',
        applicationId: 'APP002',
        createdAt: '2024-03-14',
    },
])

// Profile form data
const profileForm = ref({
    name: '',
    gender: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    photo: null as File | null,
})

const genderOptions = [
    { title: 'Male', value: 'male' },
    { title: 'Female', value: 'female' },
    { title: 'Other', value: 'other' },
]

// Function to handle new document button click
const handleNewDocument = () => {
    // Add your logic for creating a new document here
    console.log('New document button clicked')
}

// Function to handle profile photo upload
const handlePhotoUpload = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
        profileForm.value.photo = input.files[0]
    }
}

// Function to handle profile save
const handleSaveProfile = () => {
    // Add your logic for saving the profile here
    console.log('Saving profile:', profileForm.value)
}
</script>

<template>
    <VRow class="match-height">
        <!-- Application Statistics Cards -->
        <VCol cols="12" md="3">
            <CardStatisticsVertical v-bind="newApplications" />
        </VCol>

        <VCol cols="12" md="3">
            <CardStatisticsVertical v-bind="pendingApplications" />
        </VCol>

        <VCol cols="12" md="3">
            <CardStatisticsVertical v-bind="approvedApplications" />
        </VCol>

        <VCol cols="12" md="3">
            <CardStatisticsVertical v-bind="rejectedApplications" />
        </VCol>

        <!-- Edit Profile Section -->
        <VCol cols="12">
            <VCard title="Edit Profile">
                <VCardText>
                    <VRow>
                        <!-- Left Column - Form Fields -->
                        <VCol cols="12" md="8">
                            <VForm>
                                <VTextField v-model="profileForm.name" label="Applicant Name" class="mb-4" />

                                <VSelect v-model="profileForm.gender" :items="genderOptions" label="Gender"
                                    class="mb-4" />

                                <VTextField v-model="profileForm.dateOfBirth" label="Date of Birth" type="date"
                                    class="mb-4" />

                                <VTextField v-model="profileForm.phoneNumber" label="Phone Number" class="mb-4" />

                                <VTextField v-model="profileForm.email" label="Email Address" type="email"
                                    class="mb-4" />
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

        <!-- Document List Section -->
        <VCol cols="12">
            <VCard title="Document List">
                <template #append>
                    <VBtn color="primary" prepend-icon="ri-add-line" @click="handleNewDocument">
                        New Document
                    </VBtn>
                </template>
                <VDataTable :headers="documentHeaders" :items="documentList" :items-per-page="10" class="text-no-wrap">
                    <template #item.sn="{ index }">
                        {{ index + 1 }}
                    </template>
                </VDataTable>
            </VCard>
        </VCol>

        <!-- Application History Section -->
        <VCol cols="12">
            <VCard title="Application History">
                <VDataTable :headers="applicationHeaders" :items="applicationHistory" :items-per-page="10"
                    class="text-no-wrap">
                    <template #item.status="{ item }">
                        <VChip
                            :color="item.status === 'Approved' ? 'success' : item.status === 'Rejected' ? 'error' : 'warning'"
                            size="small" class="text-capitalize">
                            {{ item.status }}
                        </VChip>
                    </template>
                </VDataTable>
            </VCard>
        </VCol>
    </VRow>
</template>
