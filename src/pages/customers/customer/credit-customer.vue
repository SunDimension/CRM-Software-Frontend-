<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { onMounted, ref } from 'vue';

// Define interfaces for Customer
interface Customer {
    id: number;
    surname: string;
    firstname: string;
    middlename?: string;
    name: string;
    address?: string;
    phone_number: string;
    branch_id: number;
    branch_name?: string;
    credit_limit?: number | null;
    credit_balance?: number;
}

const customers = ref<Customer[]>([]);
const selectedCustomer = ref<Customer | null>(null);
const creditLimit = ref<number | null>(null);
const search = ref('');
const filteredData = ref<Customer[]>([]);
const currentPage = ref<number>(1);
const loading = ref(false);
const snackbar = ref(false);
const message = ref('');
const showFormDialog = ref(false);
const tableLoading = ref(false);

const headers = [
    { title: 'S/N', key: 'sn' },
    { title: 'Name', key: 'name' },
    { title: 'Phone Number', key: 'phone_number' },
    { title: 'Address', key: 'address' },
    { title: 'Branch', key: 'branch_name' },
    { title: 'Credit Limit', key: 'credit_limit' },
    { title: 'Credit Balance', key: 'credit_balance' },
];

// Fetch all customers
const fetchCustomers = async () => {
    try {
        loading.value = true;
        const response = await makeApiCall<Customer[]>('GET', '/customers');
        customers.value = response.data;
        filteredData.value = customers.value; // Initially display all customers
    } catch (error) {
        console.error('Error fetching customers:', error);
    } finally {
        loading.value = false;
        tableLoading.value = false;
    }
};

interface AssignCreditResponse {
    message: string;
    customer: Customer;
}

// Assign credit limit to a selected customer
const assignCreditLimit = async () => {
    if (!selectedCustomer.value || creditLimit.value === null) {
        snackbar.value = true;
        message.value = 'Please select a customer and enter a valid credit limit.';
        return;
    }
    try {
        loading.value = true;
        showFormDialog.value = false;
        tableLoading.value = true;

        const payload = {
            credit_limit: creditLimit.value,
            id: selectedCustomer.value?.id
        };

        const response = await makeApiCall<AssignCreditResponse>(
            'POST',
            `/customers/${selectedCustomer.value?.id}/assign-credit`,
            payload
        );

        if (response?.data?.customer) {
            selectedCustomer.value.credit_limit = response.data.customer.credit_limit;
            await fetchCustomers();
            message.value = 'Credit assigned successfully!';
        } else {
            console.error('Unexpected response:', response);
        }
    } catch (error) {
        console.error('Error assigning credit limit:', error);
        message.value = 'Error assigning credit limit';
    } finally {
        loading.value = false;
        tableLoading.value = false;
        snackbar.value = true;
    }
};

// Remove credit limit from a customer
const removeCreditLimit = async () => {
    if (!selectedCustomer.value) {
        snackbar.value = true;
        message.value = 'Please select a customer to remove credit limit.';
        return;
    }
    try {
        loading.value = true;
        showFormDialog.value = false;
        tableLoading.value = true;

        const payload = {
            credit_limit: null, 
            id: selectedCustomer.value?.id
        };

        const response = await makeApiCall<AssignCreditResponse>(
            'POST',
            `/customers/${selectedCustomer.value?.id}/assign-credit`,
            payload
        );

        if (response?.data?.customer) {
            selectedCustomer.value.credit_limit = response.data.customer.credit_limit;
            await fetchCustomers();
            message.value = 'Credit limit removed successfully!';
        } else {
            console.error('Unexpected response:', response);
        }
    } catch (error) {
        console.error('Error removing credit limit:', error);
        message.value = 'Error removing credit limit';
    } finally {
        loading.value = false;
        tableLoading.value = false;
        snackbar.value = true;
    }
};

// Handle selection from dropdown
const handleOptionSelected = (value: any, label: string) => {
    if (label === 'Customer') {
        selectedCustomer.value = value;
    } 
};

// Filter data by search term
const handleFilter = () => {
    const searchTerm = search.value.toLowerCase().trim();
    filteredData.value = customers.value.filter((customer) =>
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.phone_number.toLowerCase().includes(searchTerm) ||
        (customer.address && customer.address.toLowerCase().includes(searchTerm))
    );
};

onMounted(fetchCustomers);
</script>

<template>
    <v-container>
        <v-row>
            <v-col>
                <v-btn color="primary" @click="showFormDialog = true">Assign / Remove Credit</v-btn>
            </v-col>
            <v-col>
                <v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify"
                    @input="handleFilter"></v-text-field>
            </v-col>
        </v-row>

        <v-card flat>
            <v-card-title class="d-flex align-center">
                Customer List
                <v-spacer></v-spacer>
            </v-card-title>

            <div v-if="tableLoading" class="text-center" style="padding: 40px">
                <v-progress-circular indeterminate size="50" />
            </div>

            <v-data-table v-else :items="filteredData" :headers="headers" :page="currentPage" sticky-header>
                <template v-slot:item.sn="{ index }">
                    {{ index + 1 }}
                </template>
            </v-data-table>
        </v-card>

        <!-- Snackbar for success/error messages -->
        <v-snackbar v-model="snackbar" timeout="3000" top>
            {{ message }}
        </v-snackbar>

        <!-- Assign Credit Dialog (Modal) -->
        <v-dialog v-model="showFormDialog" persistent max-width="600px">
            <v-card>
                <v-card-title>Manage Credit Limit</v-card-title>
                <v-card-text>
                    <filterSelect 
                        :genericOptions="customers" 
                        :label_cus="'Customer*'"
                        @optionSelected="(item) => handleOptionSelected(item, 'Customer')" 
                        v-model="selectedCustomer" 
                    />
                    <v-text-field label="Credit Limit" v-model="creditLimit" type="number"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" :loading="loading" @click="assignCreditLimit">
                        Assign Credit
                    </v-btn>
                    <v-btn color="error" :loading="loading" @click="removeCreditLimit">
                        Remove Credit
                    </v-btn>
                    <v-btn @click="showFormDialog = false">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>
