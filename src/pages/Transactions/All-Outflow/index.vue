<script setup lang="ts">
import { makeApiCall } from '@/services/apiService'; // Import the PostOutflow interface
import { GenericSetUp, PostOutflow } from '@/types/globalTypes'; // Import GenericSetUp type
import { onMounted, ref } from 'vue';

// Reactive variables for form inputs
const selectedBank = ref<number | null>(null);
const fromDate = ref<Date | null>(null);
const toDate = ref<Date | null>(null);

// Show table flag
const showTable = ref(false);

// Placeholder for fetched outflows
const outflows = ref<PostOutflow[]>([]);

// Placeholder for banks and outflow modes (loaded from API)
const banks = ref<GenericSetUp[]>([]);
const outflowModes = ref<GenericSetUp[]>([]);


const formatDate = (date: Date | null): string | null => {
    if (!date) return null; // Handle null case
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Function to format outflow date
const formatOutflowDate = (date: string | number | Date | undefined): string => {
  if (!date) return 'N/A'; // Handle undefined or null cases
  const parsedDate = new Date(date);
  return isNaN(parsedDate.getTime()) ? 'Invalid Date' : parsedDate.toLocaleDateString(); // Check for invalid date
};

// Function to fetch outflows based on selected bank and date range
const fetchOutflows = async (): Promise<void> => {
    if (!selectedBank.value || !fromDate.value || !toDate.value) {
        alert('Please select a bank and date range.');
        return;
    }

    try {
       
        const response = await makeApiCall<{ data: PostOutflow[] }>('POST', `/search-post-outflows`, {
            
               bene_bank: selectedBank.value,  // Bank ID selected from dropdown
            from_date: fromDate.value,      // Date in format 'YYYY-MM-DD'
            to_date: toDate.value, 
            }
        );

        console.log("API Response: ", response); // Debugging to check API response
        console.log("Fetched Data: ", response.data);

        // Check if data exists in response and set outflows accordingly
        if (response && Array.isArray(response.data)) {
            outflows.value = response.data; // Set the outflows array directly
            showTable.value = true; // Set the table to show after data is fetched
        } else {
            outflows.value = []; // Fallback in case the response is empty or doesn't have data
        }
    } catch (error) {
        console.error('Error fetching outflows:', error);
        alert('An error occurred while fetching outflows. Please try again later.');
        outflows.value = []; // Reset outflows on error
    }
};

// Function to fetch banks and outflow modes from the API
const fetchBanksAndOutflowModes = async () => {
    try {
        const [banksResponse, modesResponse] = await Promise.all([
            makeApiCall<{ data: GenericSetUp[] }>('GET', '/banks'),
            makeApiCall<{ data: GenericSetUp[] }>('GET', '/outflow-modes'),
        ]);


           banks.value = (banksResponse.data as unknown) as GenericSetUp[];
        outflowModes.value = (modesResponse.data as unknown) as GenericSetUp[];

    } catch (error) {
        console.error('Error fetching banks or outflow modes:', error);
    }
};


const headers = [
  { title: 'S/N', key: 'sn' },
  { title: 'Bank (Beneficiary Bank)', key: 'bene_bank' },
  { title: 'Amount', key: 'amount' },
  { title: 'Narration', key: 'narration' },
  { title: 'Outflow Mode', key: 'outflow_mode' },
  { title: 'Date', key: 'outflow_date' }
];

// Get the name of the bank or outflow mode by ID
const getBankName = (id: number | undefined): string => {
    const bank = banks.value.find((b) => b.id === id);
    return bank ? bank.name : 'Unknown Bank';
};

const getOutflowModeName = (id: number | undefined): string => {
    const mode = outflowModes.value.find((m) => m.id === id);
    return mode ? mode.name : 'Unknown Mode';
};

// Reset form
const resetForm = () => {
    selectedBank.value = null;
    fromDate.value = null;
    toDate.value = null;
    showTable.value = false;
    outflows.value = [];
};

// Fetch banks and outflow modes on mount
onMounted(() => {
    fetchBanksAndOutflowModes();
});
</script>

<template>
  <v-card>
    <v-card-title class="headline">Outflows</v-card-title>
    <v-card-text>
      <div class="form-grid">
        <!-- Bank Selector -->
        <v-select
          v-model="selectedBank"
          :items="banks"
          item-title="name"
          item-value="id"
          label="Select Bank"
          required
        ></v-select>

        <!-- Date Range (From and To) -->
        <v-text-field
          v-model="fromDate"
          label="From Date"
          type="date"
          required
        ></v-text-field>
        <v-text-field
          v-model="toDate"
          label="To Date"
          type="date"
          required
        ></v-text-field>
      </div>

      <!-- Buttons -->
      <v-btn color="primary" @click="fetchOutflows">View</v-btn>
      <v-btn color="red" @click="resetForm">Cancel</v-btn>

      <!-- Outflows Table -->
      <v-data-table
        v-if="showTable"
        :headers="headers"
        :items="outflows"
        item-key="id"
      >
        <template v-slot:item.sn="{ index }">
          {{ index + 1 }}
        </template>
        <template v-slot:item.bene_bank="{ item }">
          {{ getBankName(item.bene_bank) }}
        </template>
        <template v-slot:item.amount="{ item }">
          {{ item.amount }}
        </template>
        <template v-slot:item.narration="{ item }">
          {{ item.narration }}
        </template>
        <template v-slot:item.outflow_mode="{ item }">
          {{ getOutflowModeName(item.outflow_mode) }}
        </template>
       <template v-slot:item.outflow_date="{ item }">
      {{ formatOutflowDate(item.outflow_date) }}
    </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
</style>
