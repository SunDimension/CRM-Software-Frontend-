<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { Branch, Customer, GenericSetUp as Gs } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref, watch } from 'vue';

// Define props
const props = defineProps<{
  titles: Gs[];
  branches: Branch[];
  customerTypes: Gs[];
  mode: 'create' | 'edit';
  customer?: Customer; // Optional prop for edit mode
}>();

const dialog = ref(false);
const apiError = ref<string | null>(null);
const emits = defineEmits(['customerCreated']);

const { handleSubmit, resetForm } = useForm({
  validationSchema: {

  },
});

// Fieldsconst surname = useField<string>('surname');
const firstname = useField<string>('firstname');
const surname = useField<string>('surname');
const middlename = useField<string>('middlename');
const address = useField<string>('address');
const phone_number = useField<string>('phone_number');


const selectedTitle = ref<Gs | null>(null);
const selectedCustomerType = ref<Gs | null>(null);
const selectedBranch = ref<Branch | null>(null);

const loading = ref(false);

// Load data for edit mode if necessary
const loadDataForEdit = () => {
  if (props.mode === 'edit' && props.customer) {
    const customer = props.customer;

    // Assigning to the fields' value properties
    surname.value.value = customer.surname;
    firstname.value.value = customer.firstname;
    middlename.value.value = customer.middlename ?? ''; // Default to empty string
    address.value.value = customer.address ?? '';
    phone_number.value.value = customer.phone_number;

    // Set title and customer type
    selectedTitle.value = props.titles.find(item => item.id === customer.title_id) ?? null;

    selectedBranch.value = props.branches.find(item => item.id === customer.branch_id) ?? null;
    selectedCustomerType.value = props.customerTypes.find(item => item.id === customer.customer_type_id) ?? null;
  }
};



// Watch for changes in props to update form data
watch(() => props.customer, loadDataForEdit, { immediate: true });

const handleOptionSelected = (value: Gs, label: string) => {
  if (label === 'Title') {
    selectedTitle.value = value;
  } else if (label === 'Customer Type') {
    selectedCustomerType.value = value;
  } else if (label === 'Branch') {
    selectedBranch.value = value;
  }
};




const submit = handleSubmit(async (values) => {
  loading.value = true;
  apiError.value = null;
  console.log('Form Data:', values);

  // Form data with the selected title and customer type IDs
  const formData: Customer = {
    surname: values.surname,
    firstname: values.firstname,
    middlename: values.middlename,
    name: `${values.firstname} ${values.surname}`,
    address: values.address,
    phone_number: values.phone_number,
    customer_type_id: selectedCustomerType.value?.id ?? 0,  // Use the selected customer type ID
    title_id: selectedTitle.value?.id ?? 0,  // Use the selected title ID
    branch_id: selectedBranch.value?.id ?? 0,
  };

  const apiMethod = props.mode === 'edit' ? 'PUT' : 'POST';
  const apiUrl = props.mode === 'edit' ? `/customers/${props.customer?.id}` : `/customers`;

  try {
    await makeApiCall<Customer>(apiMethod, apiUrl, formData);
    emits('customerCreated');
    dialog.value = false;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      apiError.value = axiosError.response?.data?.message || "An unexpected error occurred.";
    } else {
      apiError.value = "An unexpected error occurred.";
    }
  } finally {
    loading.value = false;
  }
});


</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="800">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-if="mode === 'create'" class="text-none font-weight-regular" color="success-darken-1"
          :text="`Create Customer`" variant="tonal" v-bind="activatorProps"></v-btn>
        <v-btn v-if="mode === 'edit'" v-bind="activatorProps" variant="plain" color="pending">
          <VIcon icon="ri-edit-line" color="warning" />
        </v-btn>
      </template>

      <v-card :title="mode === 'edit' ? 'Edit Customer' : 'Create Customer'">
        <v-card-text>
          <form @submit.prevent="submit">
            <v-container fluid>
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <filterSelect :genericOptions="titles" :label_cus="'Title*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Title')" v-model="selectedTitle" />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="surname.value.value" label="Surname"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="firstname.value.value" label="Firstname"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="middlename.value.value" label="Middlename"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="address.value.value" label="Address"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="phone_number.value.value" label="Phone Number"></v-text-field>
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <filterSelect :genericOptions="customerTypes" :label_cus="'Customer Type*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Customer Type')"
                    v-model="selectedCustomerType" />
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <filterSelect :genericOptions="branches" :label_cus="'Branch*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Branch')" v-model="selectedBranch" />
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

              <v-btn color="success-darken-1" type="submit"
                :text="mode === 'edit' ? 'Update Customer' : 'Create Customer'" variant="tonal" :loading="loading"
                :disabled="loading">
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
