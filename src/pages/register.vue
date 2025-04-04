<script setup lang="ts">
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import logo from '@images/logo.svg?raw'
import authV1MaskDark from '@images/pages/auth-v1-mask-dark.png'
import authV1MaskLight from '@images/pages/auth-v1-mask-light.png'
import axios from 'axios'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

const router = useRouter()

const form = ref({
  name: '',
  email: '',
  password: '',
  role_id: null as number | null,
  privacyPolicies: false,
})

const vuetifyTheme = useTheme()
const authThemeMask = computed(() => {
  return vuetifyTheme.global.name.value === 'light'
    ? authV1MaskLight
    : authV1MaskDark
})

const isPasswordVisible = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const roles = ref([
  { title: 'Admin', value: 1 },
  { title: 'Student', value: 2 },
])

const validateForm = () => {
  if (!form.value.name) {
    errorMessage.value = 'Name is required'
    return false
  }

  if (!form.value.email) {
    errorMessage.value = 'Email is required'
    return false
  }

  if (!form.value.password) {
    errorMessage.value = 'Password is required'
    return false
  }

  if (form.value.password.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters'
    return false
  }

  if (!form.value.role_id) {
    errorMessage.value = 'Please select a role'
    return false
  }

  if (!form.value.privacyPolicies) {
    errorMessage.value = 'You must agree to the privacy policy'
    return false
  }

  return true
}

const handleRegister = async () => {
  if (!validateForm()) return;

  try {
    isLoading.value = true;
    const response = await axios.post(
      `${import.meta.env.VITE_APP_API_ENDPOINT}/register`,
      {
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        role_id: form.value.role_id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    router.push('/login');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      errorMessage.value = error.response?.data?.message ||
        'Registration failed. Please try again.';
    } else {
      errorMessage.value = 'An unexpected error occurred';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard class="auth-card pa-4 pt-7" max-width="448">
      <VCardItem class="justify-center">
        <template #prepend>
          <div class="d-flex">
            <div v-html="logo" />
          </div>
        </template>

        <VCardTitle class="font-weight-semibold text-2xl text-uppercase">
          Welcome to CRM!
        </VCardTitle>
      </VCardItem>

      <VCardText class="pt-2">
        <h5 class="text-h5 font-weight-semibold mb-1">
          Adventure starts here 🚀
        </h5>
        <p class="mb-0">
          Register your account to get started
        </p>
      </VCardText>

      <VCardText>
        <VForm @submit.prevent="handleRegister">
          <VRow>
            <!-- Name -->
            <VCol cols="12">
              <VTextField v-model="form.name" label="Full Name" placeholder="John Doe"
                :error-messages="errorMessage && !form.name ? 'Name is required' : ''" />
            </VCol>

            <!-- email -->
            <VCol cols="12">
              <VTextField v-model="form.email" label="Email" placeholder="johndoe@email.com" type="email"
                :error-messages="errorMessage && !form.email ? 'Email is required' : ''" />
            </VCol>

            <!-- password -->
            <VCol cols="12">
              <VTextField v-model="form.password" label="Password" placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                :error-messages="errorMessage && !form.password ? 'Password is required' : ''" />
              <div class="text-caption text-disabled mt-1">
                Password must be at least 8 characters
              </div>
            </VCol>

            <!-- Role Selection -->
            <VCol cols="12">
              <VSelect v-model="form.role_id" :items="roles" label="Register as" item-title="title" item-value="value"
                :error-messages="errorMessage && !form.role_id ? 'Role is required' : ''" required />
            </VCol>

            <VCol cols="12">
              <div class="d-flex align-center mt-1 mb-4">
                <VCheckbox id="privacy-policy" v-model="form.privacyPolicies"
                  :error-messages="errorMessage && !form.privacyPolicies ? 'You must agree' : ''" inline />
                <VLabel for="privacy-policy" style="opacity: 1;">
                  <span class="me-1">I agree to</span>
                  <a href="javascript:void(0)" class="text-primary">privacy policy & terms</a>
                </VLabel>
              </div>

              <VBtn block type="submit" :loading="isLoading" :disabled="isLoading">
                Sign up
              </VBtn>

              <div v-if="errorMessage" class="text-error mt-2">
                {{ errorMessage }}
              </div>

              <div v-if="successMessage" class="text-success mt-2">
                {{ successMessage }}
              </div>
            </VCol>

            <!-- login instead -->
            <VCol cols="12" class="text-center text-base">
              <span>Already have an account?</span>
              <RouterLink class="text-primary ms-2" to="login">
                Sign in instead
              </RouterLink>
            </VCol>

            <VCol cols="12" class="d-flex align-center">
              <VDivider />
              <span class="mx-4">or</span>
              <VDivider />
            </VCol>

            <!-- auth providers -->
            <VCol cols="12" class="text-center">
              <AuthProvider />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>
