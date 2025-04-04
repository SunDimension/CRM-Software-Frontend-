<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { Account, JournalEntry, JournalType, Warehouse } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { onMounted, ref } from 'vue';
import * as yup from 'yup';

const warehouses = ref<Warehouse[]>([]);
const journalTypes = ref<JournalType[]>([]);
const accounts = ref<Account[]>([]);
const step = ref(1);
const showDialog = ref(false);
let message ="";

let journalDetails = reactive([
    {
      journal_type_id: '',
      amount: 0,
      description: '',
      account_id: '',
      account_no: '',
    },
  ])

let formValues = ref({
  description: '',
  payment_date: '',
  warehouse_id: null,
  vendor_id: '',
  journal_entries: [
    {
      journal_type_id: '',
      amount: 0,
      description: '',
      account_id: '',
      account_no: '',
    },
  ],
});

const validationSchema = yup.object({
  description: yup.string().required('Description is required.'),
  payment_date: yup.string().required('Payment date is required.'),
  warehouse_id: yup.number().nullable().required('Warehouse is required.'),
  vendor_id: yup.string(),
  journal_entries: yup.array().of(
    yup.object({
      journal_type_id: yup.string().required('Journal Type is required.'),
      amount: yup.number().required('Amount is required.').typeError('Amount must be a number.'),
      description: yup.string().required('Description is required.'),
      account_id: yup.string().required('Account is required.'),
      account_no: yup.string().nullable(),
    })
  ),
});

const { handleSubmit, isSubmitting } = useForm({
  validationSchema,
  initialValues: formValues.value,
});

const journalEntries =  journalDetails

const description = useField('description', formValues.value.description);
const payment_date = useField('payment_date', formValues.value.payment_date);
// const warehouse_id = useField('warehouse_id', formValues.value.warehouse_id);
const vendor_id = useField('vendor_id', formValues.value.vendor_id);

const fetchWarehouses = async () => {
  try {
    const response = await makeApiCall<Warehouse[]>('GET', '/warehouses');
    warehouses.value = response.data;
  } catch (error) {
    console.error('Error fetching warehouses:', error);
  }
};

const fetchJournalTypes = async () => {
  try {
    const response = await makeApiCall<JournalType[]>('GET', '/journal-types');
    journalTypes.value = response.data;
  } catch (error) {
    console.error('Error fetching journal types:', error);
  }
};

const fetchAccounts = async () => {
  try {
    const response = await makeApiCall<Account[]>('GET', '/accounts');
    accounts.value = response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
  }
};

// Auto-fill account_no based on account_id
watch(
  () => journalDetails.map(entry => entry.account_id),
  (newAccountIds) => {
    newAccountIds.forEach((accountId, index) => {
      const selectedAccount = accounts.value.find(account => account.id === accountId);
      if (selectedAccount) {
        journalDetails[index].account_no = selectedAccount.code;
      }
    });
  }
);

const submit = handleSubmit(async (values) => {
  // try {
  //   console.log(values);
  //   await makeApiCall<JournalEntry>('POST', '/journal-entries', values);
  //   console.log('Journal Entry created successfully');
  // } catch (error) {
  //   console.error('Error creating Journal Entry:', error);
  // }
});

const submitForm = async (event: any) => {
  event.preventDefault();
  try {
    const data = {
        description: description.value.value,
        payment_date: payment_date.value.value,
        // warehouse_id: warehouse_id.value,
        vendor_id: vendor_id.value.value,
        journal_entries: journalDetails
      }
    //formValues.value.journal_entries = journalDetails;
    console.log(JSON.stringify(data));
    
    await makeApiCall<JournalEntry>('POST', '/journal-entries', data).then((d)=>{
      nextStep();
      showDialog.value = true;
      message = "Journal Entry created successfully";
    });
    console.log('Journal Entry created successfully');
  } catch (error) {
    console.error('Error creating Journal Entry:', error);
  }
};

const nextStep = () => {
  if (step.value < 3) {
    step.value += 1;
  }
};

const prevStep = () => {
  if (step.value > 1) {
    step.value -= 1;
  }
};

const addRow =() =>{
  journalDetails.push({ journal_type_id: '', amount: 0, description: '', account_id: '', account_no: '' });
}

const useResetForm =() =>{
  journalDetails = reactive([
    {
      journal_type_id: '',
      amount: 0,
      description: '',
      account_id: '',
      account_no: '',
    },
  ])

formValues = ref({
  description: '',
  payment_date: '',
  warehouse_id: null,
  vendor_id: '',
  journal_entries: [
    {
      journal_type_id: '',
      amount: 0,
      description: '',
      account_id: '',
      account_no: '',
    },
  ],
});

step.value = 1;
}

const removeRow = (index: number) => {
  if( index > 0){
    journalDetails.splice(index, 1);
  }
}
function getJournalTypeName(id: any) {
    const type = journalTypes.value.find(type => type.id === id);
    return type ? type.name : 'Unknown';
  }
  function  getAccountName(id: any) {
    const account = accounts.value.find(account => account?.id === id);
    return account ? account.name : 'Unknown';
  }

onMounted(() => {
  fetchWarehouses();
  fetchJournalTypes();
  fetchAccounts();
});


</script>

<template>
  <v-card title="Create Journal Entry">
    <v-card-text>
      <form @submit="submitForm($event)">
      <v-stepper v-model="step" :alt-label="true">
        <v-stepper-header>
          <v-stepper-step :complete="step > 1" step="1" editable>Journal Entry</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="step > 2" step="2" editable>Confirmation</v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="3" editable>Completion</v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <!-- Step 1: Description -->
          <v-stepper-content step="1" v-if="step === 1">
            <div class="form-grid">
              <v-text-field
                v-model="description.value.value"
                :error-messages="description.errorMessage.value"
                label="Description"
                required
              ></v-text-field>
              <v-text-field
                v-model="payment_date.value.value"
                :error-messages="payment_date.errorMessage.value"
                label="Payment Date"
                type="date"
                required
              ></v-text-field>
              <!-- <v-select
                v-model="warehouse_id.value.value"
                :items="warehouses"
                item-title="name"
                item-value="id"
                :error-messages="warehouse_id.errorMessage.value"
                label="Warehouse"
                required
              ></v-select> -->
              <v-text-field
                v-model="vendor_id.value.value"
                :error-messages="vendor_id.errorMessage.value"
                label="Vendor (Optional)"
              ></v-text-field>
            </div>
            <br>
         
            <div v-for="(entry, index) in journalDetails" :key="index" class="form-grid2">
              <v-select
                v-model="entry.journal_type_id"
                :items="journalTypes"
                item-title="name"
                item-value="id"
                label="Journal Type"
                required
              ></v-select>
              <v-select
                v-model="entry.account_id"
                :items="accounts"
                item-title="name"
                item-value="id"
                label="Account"
                required
              ></v-select>
              <v-text-field
                v-model="entry.account_no"
                label="Account No (Auto-filled)"
                readonly
              ></v-text-field>
              <v-text-field
                v-model="entry.amount"
                label="Amount"
                type="number"
                required
              ></v-text-field>
              <v-text-field
                v-model="entry.description"
                label="Description"
                required
              ></v-text-field>
              
              <v-btn icon @click="removeRow(index)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <br>
            </div>
            <v-btn @click="addRow()">
              Add Journal Entry
            </v-btn>
            <v-btn @click="nextStep" :disabled="description.errorMessage.value">Next</v-btn>
          </v-stepper-content>

          <!-- Step 2: Date & Warehouse -->
          <v-stepper-content step="2" v-if="step === 2">
            <!-- Display Section for Entered Values -->
          <v-card class="mt-5">
            <v-card-title>Confirmation</v-card-title>
            <v-list dense class="form-grid">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Description</v-list-item-title>
                  <v-list-item-subtitle>{{ description.value.value }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Payment Date</v-list-item-title>
                  <v-list-item-subtitle>{{ payment_date.value.value }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Vendor</v-list-item-title>
                  <v-list-item-subtitle>{{ vendor_id.value.value || 'N/A' }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
          </v-list>
              <!-- Loop through journalDetails and display each entry -->
              <v-divider></v-divider>
              <v-list dense>
                <v-list-item-group class="form-grid2 text-bold">
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Journal Type</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ index + 1 }}. {{ getJournalTypeName(entry.journal_type_id) }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Account</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ getAccountName(entry.account_id) }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Account Code</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ entry.account_no }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Amount</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ entry.amount }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Description</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ entry.description }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
              <v-list-item-group v-for="(entry, index) in journalDetails" :key="index" class="form-grid2">
                <v-list-item>
                  <v-list-item-content>
                    <!-- <v-list-item-title>Journal Type (Entry {{ index + 1 }})</v-list-item-title> -->
                    <v-list-item-title>{{ index + 1 }}. {{ getJournalTypeName(entry.journal_type_id) }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <!-- <v-list-item-title>Account</v-list-item-title> -->
                    <v-list-item-title>{{ getAccountName(entry.account_id) }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <!-- <v-list-item-title>Account No</v-list-item-title> -->
                    <v-list-item-title>{{ entry.account_no }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <!-- <v-list-item-title>Amount</v-list-item-title> -->
                    <v-list-item-title>{{ entry.amount }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <!-- <v-list-item-title>Description</v-list-item-title> -->
                    <v-list-item-title>{{ entry.description }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card>

            <v-btn @click="prevStep">Previous</v-btn>
            <!-- <v-btn @click="nextStep" :disabled="payment_date.errorMessage.value ">Next</v-btn> -->
            <v-btn  type="submit">Submit</v-btn>
          </v-stepper-content>

          <!-- Step 3: Vendor & Journal Entries -->
          <v-stepper-content step="3" v-if="step === 3">
            <v-card class="mt-5">
            <v-card-title>Completion</v-card-title>
            <v-list dense class="form-grid">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Description</v-list-item-title>
                  <v-list-item-subtitle>{{ description.value.value }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Payment Date</v-list-item-title>
                  <v-list-item-subtitle>{{ payment_date.value.value }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Vendor</v-list-item-title>
                  <v-list-item-subtitle>{{ vendor_id.value.value || 'N/A' }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
          </v-list>
              <!-- Loop through journalDetails and display each entry -->
              <v-divider></v-divider>
              <v-list dense>
                <v-list-item-group class="form-grid2 text-bold">
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Journal Type</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ index + 1 }}. {{ getJournalTypeName(entry.journal_type_id) }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Account</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ getAccountName(entry.account_id) }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Account Code</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ entry.account_no }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Amount</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ entry.amount }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title><b>Description</b></v-list-item-title>
                    <!-- <v-list-item-title>{{ entry.description }}</v-list-item-title> -->
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
              <v-list-item-group v-for="(entry, index) in journalDetails" :key="index" class="form-grid2">
                <v-list-item>
                  <v-list-item-content>
                    <!-- <v-list-item-title>Journal Type (Entry {{ index + 1 }})</v-list-item-title> -->
                    <v-list-item-title>{{ index + 1 }}. {{ getJournalTypeName(entry.journal_type_id) }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <!-- <v-list-item-title>Account</v-list-item-title> -->
                    <v-list-item-title>{{ getAccountName(entry.account_id) }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <!-- <v-list-item-title>Account No</v-list-item-title> -->
                    <v-list-item-title>{{ entry.account_no }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <!-- <v-list-item-title>Amount</v-list-item-title> -->
                    <v-list-item-title>{{ entry.amount }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <!-- <v-list-item-title>Description</v-list-item-title> -->
                    <v-list-item-title>{{ entry.description }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card>
            <v-btn @click="useResetForm()">Create New Entry</v-btn>
            
            <!-- <v-btn :loading="isSubmitting" @click="submit">Submit</v-btn> -->
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </form>
    </v-card-text>
  </v-card>

  <v-dialog v-model="showDialog" persistent max-width="400">
    <v-card>
      <v-card-title class="headline">Notification</v-card-title>
      <v-card-text>
        {{ message }}
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" text @click="showDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two columns with equal width */
  gap: 16px; /* Adjust the gap between columns as needed */
}

.form-grid2 {
  display: grid;
  grid-template-columns: 4fr 4fr 4fr 4fr 4fr 1fr; /* Two columns with equal width */
  gap: 16px; /* Adjust the gap between columns as needed */
}
.form-grid > * {
  min-width: 0; /* Ensures the items do not overflow */
}
</style>
