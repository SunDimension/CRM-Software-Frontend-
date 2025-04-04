<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { GenericSetUp as Gs, Vendor } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref, watch } from 'vue';

// Define props
const props = defineProps<{
  banks: Gs[];
  titles: Gs[];
  designations: Gs[];
  vendorTypes: Gs[];
  serviceTypes: Gs[];
  mode: 'create' | 'edit';
  vendor?: Vendor; // Optional prop for edit mode
}>();

const dialog = ref(false);
const apiError = ref<string | null>(null);
const emits = defineEmits(['vendorCreated']);

const { handleSubmit } = useForm({
  validationSchema: {
    name(value: string) {
      if (value && value.trim() !== '') return true;
      return 'Vendor Name is required.';
    },
    contact_phone_number(value: string) {
      if (value && value.trim() !== '') return true;
      return 'Contact Phone Number is required.';
    },
    // Add other field validations as needed
  },
});

const name = useField('name');
const title = useField('title');
const designation = useField('designation');
const contact_surname = useField('contact_surname');
const contact_firstname = useField('contact_firstname');
const contact_middlename = useField('contact_middlename');
const vendor_type = useField('vendor_type');
const service_type = useField('service_type');
const contact_phone_number = useField('contact_phone_number');
const contact_email = useField('contact_email');
const image_url = useField('image_url');
const tin = useField('tin');
const bank = useField('bank');
const account_number = useField('account_number');
const account_name = useField('account_name');

const selectedTitle = ref<Gs | null>(null);
const selectedDesignation = ref<Gs | null>(null);
const selectedVendorType = ref<Gs | null>(null);
const selectedServiceType = ref<Gs | null>(null);
const selectedBank = ref<Gs | null>(null);

const loading = ref(false);

// Load data for edit mode if necessary
const loadDataForEdit = () => {
  if (props.mode === 'edit' && props.vendor) {
    const vendor = props.vendor;

    name.value.value = vendor.name;
    contact_surname.value.value = vendor.contact_surname;
    contact_firstname.value.value = vendor.contact_firstname;
    contact_middlename.value.value = vendor.contact_middlename;
    contact_phone_number.value.value = vendor.contact_phone_number;
    contact_email.value.value = vendor.contact_email;
    image_url.value.value = vendor.image_url;
    tin.value.value = vendor.tin;
    account_number.value.value = vendor.account_number;
    account_name.value.value = vendor.account_name;

    selectedTitle.value = props.titles.find(item => item.id === vendor.title) ?? null;
    selectedDesignation.value = props.designations.find(item => item.id === vendor.designation) ?? null;
    selectedVendorType.value = props.vendorTypes.find(item => item.id === vendor.vendor_type) ?? null;
    selectedServiceType.value = props.serviceTypes.find(item => item.id === vendor.service_type) ?? null;
    selectedBank.value = props.banks.find(item => item.id === vendor.bank) ?? null;
  }
};

// Watch for changes in props to update form data
watch(() => props.vendor, loadDataForEdit, { immediate: true });

const handleOptionSelected = (value: any, label: string) => {
  if (label === 'Title') {
    selectedTitle.value = value;
  } else if (label === 'Designation') {
    selectedDesignation.value = value;
  } else if (label === 'Vendor Type') {
    selectedVendorType.value = value;
  } else if (label === 'Service Type') {
    selectedServiceType.value = value;
  } else if (label === 'Bank') {
    selectedBank.value = value;
  }
};

const submit = handleSubmit((values) => {
  loading.value = true;
  apiError.value = null;

  const formData: Vendor = {
    name: values.name,
    title: selectedTitle.value?.id ?? 0,
    designation: selectedDesignation.value?.id ?? 0,
    contact_surname: values.contact_surname,
    contact_firstname: values.contact_firstname,
    contact_middlename: values.contact_middlename,
    vendor_type: selectedVendorType.value?.id ?? 0,
    service_type: selectedServiceType.value?.id ?? 0,
    contact_phone_number: values.contact_phone_number,
    contact_email: values.contact_email,
    image_url: values.image_url,
    tin: values.tin,
    bank: selectedBank.value?.id ?? 0,
    account_number: values.account_number,
    account_name: values.account_name,
  };

  const apiMethod = props.mode === 'edit' ? 'PUT' : 'POST';
  const apiUrl = props.mode === 'edit' ? `/vendors/${props.vendor?.id}` : `/vendors`;

  makeApiCall<Vendor>(apiMethod, apiUrl, formData)
    .then(() => {
      emits('vendorCreated');
      dialog.value = false;
    })
    .catch(() => {
      apiError.value = "An unexpected error occurred.";
    })
    .finally(() => {
      loading.value = false;
    });
});
</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="800">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
          v-if="mode === 'create'"
          class="text-none font-weight-regular"
          color="success-darken-1"
          prepend-icon=""
          :text="`Create Vendor`"
          variant="tonal"
          v-bind="activatorProps"
        ></v-btn>
        <v-btn
          v-if="mode === 'edit'"
          v-bind="activatorProps"
          variant="plain"
          color="pending"
        >
          <VIcon icon="ri-edit-line" color="warning" />
        </v-btn>
      </template>

      <v-card :title="mode === 'edit' ? 'Edit Vendor' : 'Create Vendor'">
        <v-card-text>
          <form @submit.prevent="submit">
            <v-container fluid>
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="name.value.value"
                    :error-messages="name.errorMessage.value"
                    label="Vendor Name*"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <filterSelect
                    :genericOptions="titles"
                    :label_cus="'Title*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Title')"
                    v-model="selectedTitle"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <filterSelect
                    :genericOptions="designations"
                    :label_cus="'Designation*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Designation')"
                    v-model="selectedDesignation"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <filterSelect
                    :genericOptions="vendorTypes"
                    :label_cus="'Vendor Type*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Vendor Type')"
                    v-model="selectedVendorType"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <filterSelect
                    :genericOptions="serviceTypes"
                    :label_cus="'Service Type*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Service Type')"
                    v-model="selectedServiceType"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="contact_surname.value.value"
                    label="Contact Surname*"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="contact_firstname.value.value"
                    label="Contact Firstname*"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="contact_middlename.value.value"
                    label="Contact Middlename"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="contact_phone_number.value.value"
                    :error-messages="contact_phone_number.errorMessage.value"
                    label="Contact Phone Number*"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="contact_email.value.value"
                    label="Contact Email"
                    type="email"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="image_url.value.value"
                    label="Image URL"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="tin.value.value"
                    label="TIN"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <filterSelect
                    :genericOptions="banks"
                    :label_cus="'Bank*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Bank')"
                    v-model="selectedBank"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="account_number.value.value"
                    label="Account Number*"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="account_name.value.value"
                    label="Account Name*"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>

            <!-- Error Message Display -->
            <div v-if="apiError" class="text-error">
              {{ apiError }}
            </div>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>

              <v-btn
                color="success-darken-1"
                type="submit"
                :text="mode === 'edit' ? 'Update Vendor' : 'Create Vendor'"
                variant="tonal"
                :loading="loading"
              >
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
