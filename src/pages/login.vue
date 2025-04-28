<script setup lang="ts">
import { useAuthStore } from '@/store/auth';
import authV1MaskDark from '@images/pages/auth-v1-mask-dark.png';
import authV1MaskLight from '@images/pages/auth-v1-mask-light.png';
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';



const form = ref({
  email: '',
  password: '',
  remember: false,
})

const vuetifyTheme = useTheme();
const router = useRouter();
const loading = ref(false)
const success = ref(false)
const error_msg = ref<null | string>(null)

const authThemeMask = computed(() => {
  return vuetifyTheme.global.name.value === 'light'
    ? authV1MaskLight
    : authV1MaskDark
})

const isPasswordVisible = ref(false);
interface User {
  // Define properties for email, password, etc. based on your authentication system
  email: string;
  password: string;
}

interface Role {
  id: number;
  name: string;
  // Add other role properties if needed
}



const useAuth = useAuthStore();
async function handleLogin() {
  loading.value = true; // Start loading indicatorn
  useAuth.login({
    email: form.value.email,
    password: form.value.password
  })
    .then((response) => {
      console.log('Login successful');
      success.value = true; // Stop loading indicator
      if (response.user?.roles?.some(role => role.name.toLowerCase() === 'admin')) {
        router.push('/');
      } else {
        router.replace('/student-dashboard');
      }

    })
    .catch((error) => {
      if (axios.isAxiosError(error) && !error.response) {
        // Network error (no response from server)
        error_msg.value = "Network error. Please check your connection.";
      } else if (error.response && error.response.status === 401) { // Invalid credentials
        error_msg.value = "Invalid email or password.";
      } else {
        // Other errors (e.g., server error, unexpected format)
        //error_msg.value = "An error occurred during login. Please try again.";
        console.error('Unexpected login error:', error);
      }
    })
    .finally(() => {
      loading.value = false; // Stop loading indicator
    });
}

</script>

<template>
  <!-- eslint-disable vue/no-v-html -->

  <!-- !there is a problem in the flex that does not seem to popup in production -->

  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard class="auth-card pa-4 pt-7" max-width="448">
      <VCardItem class="justify-center">

        <img src="/logo.jpg" alt="" style="inline-size: 100%;">
      </VCardItem>

      <VCardText class="pt-2">
        <h5 class="text-h5 font-weight-semibold mb-1" style="text-align: center;">
          Welcome to<br> Customer Relationship Management! (CRM)
        </h5>
        <p class="mb-0">
          Please sign-in to your account
        </p>
      </VCardText>

      <VCardText>
        <VForm @submit.prevent="() => { handleLogin() }">
          <VRow>
            <!-- email -->
            <VCol cols="12">
              <VTextField v-model="form.email" label="Email" type="email" required />
            </VCol>

            <!-- password -->
            <VCol cols="12">
              <VTextField v-model="form.password" label="Password" required placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible" />
              <div v-if="error_msg" class="error-message">{{ error_msg }}</div>
              <div v-if="success" class="success-message">Login Successful</div>

              <!-- remember me checkbox -->
              <div class="d-flex align-center justify-space-between flex-wrap mt-1 mb-4">
                <VCheckbox v-model="form.remember" label="Remember me" />

                <a class="ms-2 mb-1" href="javascript:void(0)">
                  Forgot Password?
                </a>
              </div>

              <!-- login button -->
              <VBtn block type="submit" text="Login" :loading="loading || success" :disabled="loading">

                <template #loader>
                  <v-progress-circular indeterminate size="24" class="mr-2" color="white" />
                </template>
              </VBtn>
              <!-- <SubmitBtn>
                Login
              </SubmitBtn> -->

            </VCol>

            <!-- create account -->
            <VCol cols="12" class="text-center text-base">
              <span>New on our platform?</span>
              <RouterLink class="text-primary ms-2" to="/register">
                Create an account
              </RouterLink>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>

    <!-- <VImg
      class="auth-footer-start-tree d-none d-md-block"
      :src="authV1Tree"
      :width="250"
    /> -->

    <!-- <VImg
      :src="authV1Tree2"
      class="auth-footer-end-tree d-none d-md-block"
      :width="350"
    /> -->

    <!-- bg img -->
    <!-- <VImg
      class="auth-footer-mask d-none d-md-block"
      :src="authThemeMask"
    /> -->
  </div>
</template>

<style lang="scss">
@use "@core/scss/pages/page-auth.scss";
</style>

<style scoped>
.error-message {
  color: red;
}

.success-message {
  color: green;
}
</style>
