<!-- src/components/DocumentPreviewModal.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'

const isOpen = ref(false)
const currentFile = ref<any>(null)
const previewUrl = ref<string>('')

const fileType = computed(() => {
    if (!currentFile.value?.mime_type) return 'unknown'
    if (currentFile.value.mime_type.includes('pdf')) return 'pdf'
    if (currentFile.value.mime_type.includes('image')) return 'image'
    if (currentFile.value.mime_type.includes('text')) return 'text'
    if (currentFile.value.mime_type.includes('word') ||
        currentFile.value.name?.endsWith('.docx')) return 'docx'
    return 'unknown'
})

const openModal = (file: any) => {
    currentFile.value = file
    isOpen.value = true

    // Generate preview URL for Office documents
    if (fileType.value === 'docx') {
        previewUrl.value = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.file_url)}`
    }
}

defineExpose({
    openModal
})
</script>

<template>
    <VDialog v-model="isOpen" max-width="800px" scrollable>
        <VCard>
            <VCardTitle class="d-flex justify-space-between align-center">
                <span>{{ currentFile?.name }}</span>
                <VBtn icon @click="isOpen = false">
                    <VIcon>mdi-close</VIcon>
                </VBtn>
            </VCardTitle>
            <VCardText>
                <!-- PDF Preview -->
                <iframe v-if="fileType === 'pdf'" :src="currentFile.file_url" width="100%" height="600px"
                    frameborder="0"></iframe>

                <!-- Image Preview -->
                <VImg v-else-if="fileType === 'image'" :src="currentFile.file_url" contain max-height="70vh"
                    class="mx-auto" />

                <!-- Word Document Preview -->
                <iframe v-else-if="fileType === 'docx'" :src="previewUrl" width="100%" height="600px"
                    frameborder="0"></iframe>

                <!-- Text Preview -->
                <VTextarea v-else-if="fileType === 'text'" :model-value="currentFile.content" readonly auto-grow
                    rows="15" />

                <!-- Unsupported Format -->
                <div v-else class="text-center pa-8">
                    <VIcon size="64" color="warning">mdi-alert-circle-outline</VIcon>
                    <h3 class="mt-4">Preview Not Available</h3>
                    <p class="text-body-2 mt-2">
                        This file type cannot be previewed in the browser.
                    </p>
                    <VBtn color="primary" class="mt-4" :href="currentFile?.file_url" download>
                        <VIcon left>mdi-download</VIcon>
                        Download File
                    </VBtn>
                </div>
            </VCardText>
        </VCard>
    </VDialog>
</template>
