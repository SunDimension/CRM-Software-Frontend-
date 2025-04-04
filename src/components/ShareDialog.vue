<!-- components/ShareDialog.vue -->
<script setup>
import { ref } from 'vue'

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const isOpen = ref(false)
const shareMethod = ref('link')
const emailRecipients = ref([])
const emailInput = ref('')
const copySuccess = ref(false)

const addEmail = () => {
  if (emailInput.value && isValidEmail(emailInput.value)) {
    emailRecipients.value.push(emailInput.value)
    emailInput.value = ''
  }
}

const removeEmail = (index) => {
  emailRecipients.value.splice(index, 1)
}

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const shareDocument = async () => {
  try {
    const payload = {
      document_id: props.document.id,
      share_method: shareMethod.value,
      recipients: emailRecipients.value
    }

    const response = await makeApiCall('POST', '/share-document', payload)
    
    if (shareMethod.value === 'copy') {
      copyToClipboard(response.data.text_to_copy)
      copySuccess.value = true
      setTimeout(() => copySuccess.value = false, 2000)
    }
    
    isOpen.value = false
  } catch (error) {
    console.error('Sharing failed:', error)
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <VDialog v-model="isOpen" max-width="500px">
    <VCard>
      <VCardTitle>Share Document</VCardTitle>
      <VCardText>
        <VRadioGroup v-model="shareMethod">
          <VRadio value="email" label="Email" />
          <VRadio value="whatsapp" label="WhatsApp" />
          <VRadio value="link" label="Get Shareable Link" />
          <VRadio value="copy" label="Copy Link" />
        </VRadioGroup>

        <div v-if="shareMethod === 'email'" class="mt-4">
          <VTextField
            v-model="emailInput"
            label="Add email recipients"
            @keyup.enter="addEmail"
          />
          <VBtn @click="addEmail" class="mt-2">Add</VBtn>
          
          <VChip
            v-for="(email, index) in emailRecipients"
            :key="index"
            class="ma-1"
            close
            @click:close="removeEmail(index)"
          >
            {{ email }}
          </VChip>
        </div>
      </VCardText>
      <VCardActions>
        <VBtn color="primary" @click="shareDocument">
          Share
        </VBtn>
        <VBtn @click="isOpen = false">Cancel</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
  
  <VSnackbar v-model="copySuccess">
    Link copied to clipboard!
  </VSnackbar>
</template>
