<script setup lang="ts">
import DocumentPreviewModal from '@/components/DocumentPreviewModal.vue'
import NotificationModal from '@/components/forms/NotificationModal.vue'
import { router } from '@/plugins/router'
import { makeApiCall } from '@/services/apiService'
import { useAuthStore } from '@/store/auth'
import { formatDate, formatNumber } from '@/types/globalTypes'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'


const modalType = ref('success')
const modalTitle = ref('')
const modalMessage = ref('')
const notificationModalRef = ref<InstanceType<typeof NotificationModal> | null>(null)
const isSaving = ref(false)
const route = useRoute()
const uploadId = route.params.id
const uploadDoc = ref<any>()
const status = ref<string>('')
const comments = ref<string>('')
const useAuth = useAuthStore()
// const previewModal = ref<InstanceType<typeof DocumentPreviewModal> | null>(null)

interface PreviewModalMethods {
    openModal: (file: {
        id?: number
        name: string
        file_url: string
        mime_type?: string
    }) => void
}

const previewModal = ref<PreviewModalMethods | null>(null)

const fetchUploadDoc = async () => {
    try {
        console.log('Fetching upload doc with ID:', uploadId)
        const response = await makeApiCall<any>('GET', `/upload-docs/${uploadId}`)
        uploadDoc.value = response.data
        console.log('Upload Doc:', uploadDoc.value)
    }
    catch (error: any) {
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        })
    }
}

const viewDocument = () => {
    if (uploadDoc.value?.attach_file) {
        previewModal.value?.openModal({
            id: uploadDoc.value.attach_file.id,
            name: uploadDoc.value.attach_file.name,
            file_url: uploadDoc.value.attach_file.file_url,
            mime_type: uploadDoc.value.attach_file.mime_type
        })
    }
}

const user = computed(() => useAuth.getUserDetails?.user)

const saveTransaction = async () => {
    if (isSaving.value) {
        alert('Transaction is already being saved!')
        return
    }

    isSaving.value = true
    try {
        const payload: any = {
            id: uploadDoc.value?.id,
            status: status.value,
            comment: comments.value,
        }

        await makeApiCall<any>('POST', '/approve-upload-docs', payload)
        console.log('Upload successfully treated.')
        router.push({ path: '/setup/pending-upload' })
    }
    catch (error: any) {
        console.error('Error saving transaction:', error.response?.data || error.message)
        modalType.value = 'error'
        modalTitle.value = 'Error'
        modalMessage.value = 'An error occurred during the operation.'
        isSaving.value = false
        notificationModalRef.value?.openModal()
    }
}

onMounted(() => {
    console.log('Route params:', route.params)
    console.log('Upload ID:', uploadId)
    fetchUploadDoc()
})
</script>

<template>
    <DocumentPreviewModal ref="previewModal" />
    <VContainer class="upload-approval-page" fluid>
        <VRow class="mt-2">
            <VCol cols="12" md="9">
                <h2>Document Approval Page</h2>

                <VRow class="mt-2">
                    <VCol>
                        <h4>Document ID: {{ uploadDoc?.id }}</h4>
                    </VCol>
                </VRow>

                <!-- Document Details -->
                <VRow class="mt-2">
                    <VCol cols="3">
                        <h4>Company: {{ uploadDoc?.company?.name || 'N/A' }}</h4>
                    </VCol>
                    <VCol cols="3">
                        <h4>Primary Folder: {{ uploadDoc?.primary_folder?.name || 'N/A' }}</h4>
                    </VCol>
                    <VCol cols="3">
                        <h4>Subfolder: {{ uploadDoc?.sub_folder?.name || 'N/A' }}</h4>
                    </VCol>
                    <VCol cols="3">
                        <h4>Date: {{ formatDate(uploadDoc?.created_at) }}</h4>
                    </VCol>
                </VRow>

                <!-- Document Details Card -->
                <VCard class="mt-4">
                    <VCardTitle>
                        <h4>Document Details</h4>
                    </VCardTitle>
                    <VCardText>
                        <VTable>
                            <thead>
                                <tr>
                                    <th>File Title</th>
                                    <th>Description</th>
                                    <th>Financial Value (₦)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{{ uploadDoc?.file_title }}</td>
                                    <td>{{ uploadDoc?.file_description }}</td>
                                    <td>{{ formatNumber(uploadDoc?.financial_value) }}</td>
                                    <td>
                                        <VBtn color="primary" @click="viewDocument"
                                            :disabled="!uploadDoc?.attach_file?.file_url" class="view-btn">

                                            View Document
                                        </VBtn>
                                    </td>
                                </tr>
                            </tbody>
                        </VTable>
                        <div v-if="uploadDoc?.attach_file" class="file-info mt-4">
                            <div class="text-caption">File Information</div>
                            <div class="d-flex align-center mt-2">
                                <VIcon color="primary" class="mr-2">
                                    {{ getFileIcon(uploadDoc.attach_file.mime_type) }}
                                </VIcon>
                                <span>{{ uploadDoc.attach_file.name }}</span>
                            </div>
                        </div>
                    </VCardText>
                </VCard>
            </VCol>

            <VCol cols="12" md="3">
                <VCard class="mt-4">
                    <VCardTitle>
                        <h3>Approve Document</h3>
                    </VCardTitle>
                    <VCardText>
                        <VRow>
                            <VCol cols="12">
                                <VText tag="label" class="mb-2">
                                    <b>Approver:</b> {{ user?.name }}
                                </VText>
                            </VCol>
                            <VCol cols="12">
                                <VText tag="label" class="mb-2">
                                    Action
                                </VText>
                                <VRadioGroup v-model="status" row>
                                    <VRadio label="Approve" value="Approved" />
                                    <VRadio label="Decline" value="Cancelled" />
                                </VRadioGroup>
                            </VCol>

                            <VCol cols="12">
                                <VText tag="label" class="mb-2">
                                    Comment
                                </VText>
                                <VTextarea v-model="comments" rows="4" :required="status == 'Cancelled'"
                                    :rules="[v => !(status === 'Cancelled' && !v) || 'Comment is required']" />
                            </VCol>

                            <VCol cols="12" class="form-actions">
                                <VBtn :disabled="(status === 'Cancelled' && !comments) || !status"
                                    @click="saveTransaction" block :loading="isSaving">
                                    {{ isSaving ? 'Processing...' : 'Submit' }}
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VCardText>
                </VCard>
            </VCol>
        </VRow>

        <NotificationModal ref="notificationModalRef" :modal-type="modalType" :modal-title="modalTitle"
            :modal-message="modalMessage" />
    </VContainer>
</template>

<script lang="ts">
function getFileIcon(mimeType?: string): string {
    if (!mimeType) return 'mdi-file'
    if (mimeType.includes('pdf')) return 'mdi-file-pdf-box'
    if (mimeType.includes('image')) return 'mdi-file-image'
    if (mimeType.includes('word') || mimeType.includes('docx')) return 'mdi-file-word-box'
    if (mimeType.includes('excel')) return 'mdi-file-excel-box'
    if (mimeType.includes('text')) return 'mdi-file-document'
    return 'mdi-file'
}
</script>

<style scoped>
.upload-approval-page {
    padding: 20px;
}

.v-card-title h4 {
    font-size: 1.1rem;
}

.v-data-table th,
.v-data-table td {
    font-size: 0.9rem;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.file-info {
    padding: 12px;
    background-color: #f5f5f5;
    border-radius: 4px;
}

.view-btn {
    min-width: 100px;
}

@media (max-width: 960px) {
    .upload-approval-page {
        padding: 10px;
    }

    .v-card-title h4 {
        font-size: 1rem;
    }
}
</style>
