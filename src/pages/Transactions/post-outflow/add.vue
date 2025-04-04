<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { Customer, GenericSetUp as Gs, PostOutflow } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref, watch } from 'vue';

// Define props
const props = defineProps<{
  banks: Gs[];         // Both org_bank and bene_bank will use this
  outflowModes: Gs[];
  customers: Customer[];
  mode: 'create' | 'edit';
  outflowData?: PostOutflow; // Optional prop for edit mode
}>();

const dialog = ref(false);
const apiError = ref<string | null>(null);
const emits = defineEmits(['outflowCreated']);

// Form validation schema
const { handleSubmit } = useForm({
  // validationSchema: {

  //   org_bank(value: Gs | null) {
  //     if (value) return true;
  //     return 'Org Bank is required.';
  //   },
  //   bene_bank(value: Gs | null) {
  //     if (value) return true;
  //     return 'Bene Bank is required.';
  //   },
  //   outflow_mode(value: Gs | null) {
  //     if (value) return true;
  //     return 'Outflow Mode is required.';
  //   },
  // },
});

// Form fields using vee-validate
// const beneficiary = useField('beneficiary');
const account_name = useField('account_name');
const account_number = useField('account_number');
const amount = useField('amount');
const narration = useField('narration');
const outflow_date = useField('outflow_date');

// Reactive refs for selected dropdown values
const selectedOrgBank = ref<Gs | null>(null); // org_bank (paying bank)
const selectedBeneBank = ref<Gs | null>(null); // bene_bank (beneficiary bank)
const selectedOutflowMode = ref<Gs | null>(null);
const selectedCustomer = ref<Customer | null>(null);

const loading = ref(false);

// Load data for edit mode
const loadDataForEdit = () => {
  if (props.mode === 'edit' && props.outflowData) {
    const outflow = props.outflowData;

    // beneficiary.value.value = props.outflowData.beneficiary || ''; // Use setValue
    account_name.value.value = props.outflowData.account_name || ''; // Use setValue
    account_number.value.value = props.outflowData.account_number || '';// Use setValue
    amount.value.value = props.outflowData.amount || '';
    narration.value.value = props.outflowData.narration || '';
    outflow_date.value.value = props.outflowData.outflow_date || '';// Use setValue

    // Set selected banks and mode using setValue to validate correctly
    selectedOrgBank.value = props.banks.find(item => item.id === outflow.org_bank) ?? null;
    selectedCustomer.value = props.customers.find(item => item.id === outflow.customer_id) ?? null;
    selectedBeneBank.value = props.banks.find(item => item.id === outflow.bene_bank) ?? null;
    selectedOutflowMode.value = props.outflowModes.find(item => item.id === outflow.outflow_mode) ?? null;
  }
};

// Watch for changes in props to update form data
watch(() => props.outflowData, loadDataForEdit, { immediate: true });

// Handle dropdown selection
const handleOptionSelected = (value: any, label: string) => {
  if (label === 'Org Bank') {
    selectedOrgBank.value = value;
  } else if (label === 'Bene Bank') {
    selectedBeneBank.value = value;
  } else if (label === 'Outflow Mode') {
    selectedOutflowMode.value = value;
  }
  else if (label === 'Customer') {
    selectedCustomer.value = value;
  }
};

// Form submission
const submit = handleSubmit((values) => {
  console.log('Form submitted with values:', values);
  loading.value = true;
  apiError.value = null;

  const formData: PostOutflow = {
    id: 0,
    org_bank: selectedOrgBank.value?.id ?? 0,
    // beneficiary: values.beneficiary,
    amount: values.amount,
    account_name: values.account_name,
    account_number: values.account_number,
    bene_bank: selectedBeneBank.value?.id ?? 0,
    customer_id: selectedCustomer.value?.id ?? 0,
    narration: values.narration,
    outflow_date: values.outflow_date,
    outflow_mode: selectedOutflowMode.value?.id ?? 0,
  };

  // If we are in edit mode, include the id
  if (props.mode === 'edit' && props.outflowData?.id) {
    formData.id = props.outflowData.id;
  }

  const apiMethod = props.mode === 'edit' ? 'PUT' : 'POST';
  const apiUrl = props.mode === 'edit' ? `/post-outflows/${props.outflowData?.id}` : `/post-outflows`;

  makeApiCall<PostOutflow>(apiMethod, apiUrl, formData)
    .then(() => {
      emits('outflowCreated');
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
        <v-btn v-if="mode === 'create'" class="text-none font-weight-regular" color="success-darken-1" prepend-icon=""
          :text="`Create Outflow`" variant="tonal" v-bind="activatorProps"></v-btn>
        <v-btn v-if="mode === 'edit'" v-bind="activatorProps" variant="plain" color="pending">
          <VIcon icon="ri-edit-line" color="warning" />
        </v-btn>
      </template>

      <v-card :title="mode === 'edit' ? 'Edit Outflow' : 'Create Outflow'">
        <v-card-text>
          <form @submit.prevent="submit">
            <v-container fluid>
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <filterSelect :genericOptions="banks" :label_cus="'Paying Bank*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Org Bank')" v-model="selectedOrgBank" />
                  <div v-if="!selectedOrgBank && apiError" class="text-error">
                    {{ 'Org Bank is required.' }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <filterSelect :genericOptions="customers" :label_cus="'Customer Name*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Customer')" v-model="selectedCustomer" />
                  <div v-if="!selectedBeneBank && apiError" class="text-error">
                    {{ 'Bene Bank is required.' }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="account_name.value.value" label="Account Name"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="account_number.value.value" :error-messages="account_number.errorMessage.value"
                    label="Account Number*" required></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <filterSelect :genericOptions="banks" :label_cus="'Recieving Bank*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Bene Bank')" v-model="selectedBeneBank" />
                  <div v-if="!selectedBeneBank && apiError" class="text-error">
                    {{ 'Bene Bank is required.' }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <filterSelect :genericOptions="outflowModes" :label_cus="'Outflow Mode*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Outflow Mode')"
                    v-model="selectedOutflowMode" />
                  <div v-if="!selectedOutflowMode && apiError" class="text-error">
                    {{ 'Outflow Mode is required.' }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="narration.value.value" label="Narration"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="outflow_date.value.value" label="Outflow Date*" type="date"
                    class="mb-5"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model="amount.value.value" label="Outflow Amount*" type="number"
                    :error-messages="amount.errorMessage.value" class="mb-5"></v-text-field>
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
                :text="mode === 'edit' ? 'Update Outflow' : 'Create Outflow'" variant="tonal" :loading="loading">
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
