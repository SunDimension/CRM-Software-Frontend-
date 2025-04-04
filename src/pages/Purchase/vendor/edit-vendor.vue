<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { useAuthStore } from '@/store/auth';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';

interface GenericSetUp {
  id?: number;
  name: string;
}

interface Vendor {
  id?: number;
  vendor_name: string;
  contact_title: number;
  contact_designation: number;
  contact_surname: string;
  contact_firstname: string;
  contact_middlename: string;
  vendor_type_id?: number;
  service_type_id?: number;
  contact_phone_number: string;
  contact_email: string;
  image_url: string;
  tin: string;
  bank_id?: number;
  account_number: string;
  account_name: string;
}

const props = defineProps<{
  vendor: Vendor;
  vendorTypes: GenericSetUp[];
  serviceTypes: GenericSetUp[];
  banks: GenericSetUp[];
  prevValues?: Vendor; 
}>();

const dialog = ref(false);
const apiError = ref<null | string>(null);
const emits = defineEmits(['updated']);

const { handleSubmit } = useForm({
  validationSchema: {
    vendor_name(value: string) {
      return value?.length >= 2 ? true : 'Vendor name needs to be at least 2 characters.';
    },
    contact_email(value: string) {
      return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(value) ? true : 'Invalid email format.';
    },
  },
});

const fields = {
  vendor_name: useField<string>('vendor_name'),
  contact_title: useField<number>('contact_title'),
  contact_designation: useField<number>('contact_designation'),
  contact_surname: useField<string>('contact_surname'),
  contact_firstname: useField<string>('contact_firstname'),
  contact_middlename: useField<string>('contact_middlename'),
  vendor_type_id: useField<number>('vendor_type_id'),
  service_type_id: useField<number>('service_type_id'),
  contact_phone_number: useField<string>('contact_phone_number'),
  contact_email: useField<string>('contact_email'),
  image_url: useField<string>('image_url'),
  tin: useField<string>('tin'),
  bank_id: useField<number>('bank_id'),
  account_number: useField<string>('account_number'),
  account_name: useField<string>('account_name'),
};

const setPreviousValues = (prevValues: Vendor) => {
  Object.keys(fields).forEach((key) => {
    if (prevValues[key as keyof Vendor]) {
      fields[key as keyof typeof fields].value.value = prevValues[key as keyof Vendor] as any;
    }
  });
};

setPreviousValues(props.vendor);

const submit = handleSubmit((values) => {
  const formData = {
    user_id: useAuthStore().getUserDetails.user.id,
    ...Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value.value])),
  };

  const api_url = `/vendors/${props.vendor.id}`;

  makeApiCall('PUT', api_url, formData)
    .then(() => {
      emits('updated');
      dialog.value = false;
    })
    .catch((error) => {
      apiError.value = error.response?.data?.message || 'An unexpected error occurred.';
    });
});
</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="800">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" variant="plain" color="pending">
          <v-icon icon="ri-edit-line" color="warning" />
        </v-btn>
      </template>

      <v-card title="Edit Vendor">
        <v-card-text>
          <form @submit.prevent="submit" class="form-grid">
            <div class="grid-container">
              <!-- Vendor Name -->
              <v-text-field v-model="fields.vendor_name.value.value" :error-messages="fields.vendor_name.errorMessage.value" label="Vendor Name" required class="form-item" />

              <!-- Contact Fields -->
              <v-text-field v-model="fields.contact_title.value.value" :error-messages="fields.contact_title.errorMessage.value" label="Contact Title" required class="form-item" />
              <v-text-field v-model="fields.contact_designation.value.value" :error-messages="fields.contact_designation.errorMessage.value" label="Contact Designation" required class="form-item" />
              <v-text-field v-model="fields.contact_surname.value.value" :error-messages="fields.contact_surname.errorMessage.value" label="Contact Surname" required class="form-item" />
              <v-text-field v-model="fields.contact_firstname.value.value" :error-messages="fields.contact_firstname.errorMessage.value" label="Contact First Name" required class="form-item" />
              <v-text-field v-model="fields.contact_middlename.value.value" :error-messages="fields.contact_middlename.errorMessage.value" label="Contact Middle Name" class="form-item" />
              <v-text-field v-model="fields.contact_phone_number.value.value" :error-messages="fields.contact_phone_number.errorMessage.value" label="Phone Number" type="tel" required class="form-item" />
              <v-text-field v-model="fields.contact_email.value.value" :error-messages="fields.contact_email.errorMessage.value" label="Email" type="email" required class="form-item" />

              <!-- Dropdown Fields -->
              <v-select :items="props.vendorTypes" item-text="name" item-value="id" v-model="fields.vendor_type_id.value.value" label="Vendor Type" required class="form-item" />
              <v-select :items="props.serviceTypes" item-text="name" item-value="id" v-model="fields.service_type_id.value.value" label="Service Type" class="form-item" />

              <!-- Bank Details -->
              <v-select :items="props.banks" item-text="name" item-value="id" v-model="fields.bank_id.value.value" label="Bank" class="form-item" />
              <v-text-field v-model="fields.account_number.value.value" :error-messages="fields.account_number.errorMessage.value" label="Account Number" class="form-item" />
              <v-text-field v-model="fields.account_name.value.value" :error-messages="fields.account_name.errorMessage.value" label="Account Name" class="form-item" />

              <!-- Other Fields -->
              <v-text-field v-model="fields.image_url.value.value" :error-messages="fields.image_url.errorMessage.value" label="Image URL" class="form-item" />
              <v-text-field v-model="fields.tin.value.value" :error-messages="fields.tin.errorMessage.value" label="TIN" class="form-item" />
            </div>

            <v-spacer class="my-5"></v-spacer>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>
              <v-btn color="success-darken-1" type="submit" text="Update Vendor" variant="tonal">
                <template #loader>
                  <v-progress-circular indeterminate size="24" class="mr-2" />
                </template>
              </v-btn>
            </v-card-actions>
          </form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.form-grid {
  display: flex;
  flex-direction: column;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.form-item {
  width: 100%;
}
</style>
