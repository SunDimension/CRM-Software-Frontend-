<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { computed, onMounted, ref } from 'vue';

// Interfaces
interface StoreItem {
    id?: number;
    item_category_id: number;
    create_item_name:string;
    create_item_id: number;
    branch_id: number;
    cost_price: number;
    selling_price: number;
    reorder_level: number;
    quantity: number;
    store_id: number;
    set_limit: number;
    discount?: number;
}

interface InventoryItem {
    id?: number;
    name: string;
    item_category_id: number;
    vendor_id: number;
    quantity?: number;
    selling_price?: number;
}

interface SetLimitResponse {
    message: string;
    storeItem: StoreItem;
}

// Reactive Data
const storeItems = ref<StoreItem[]>([]);
const products = ref<InventoryItem[]>([]);
const selectedProduct = ref<StoreItem | null>(null);
const setLimit = ref<number | null>(null);
const search = ref('');
const loading = ref(false);
const snackbar = ref(false);
const message = ref('');
const showFormDialog = ref(false);
const tableLoading = ref(false);

// Table Headers
const headers = [
    { title: 'S/N', key: 'sn' },
    { title: 'Name', key: 'name' },
    { title: 'Branch', key: 'branch_name' },
    { title: 'Sales Limit', key: 'set_limit' },
];

// Fetch Products
const fetchProducts = async () => {
    try {
        loading.value = true;
        const response = await makeApiCall<StoreItem[]>('GET', '/my-store-items');
        console.log('API Response:', response.data); // Debugging
        storeItems.value = response.data;
    } catch (error) {
        console.error('Error fetching Store Items:', error);
    } finally {
        loading.value = false;
        tableLoading.value = false;
    }
};


// Computed: Transformed options for filterSelect
const genericOptions = computed(() =>
    storeItems.value.map(item => ({
        id: item.id,
        name: item.create_item_name  // Use name directly from API response
    }))
);


// Assign or Remove Sales Limit
const updateSalesLimit = async (newLimit: number | null) => {
    if (!selectedProduct.value) {
        snackbar.value = true;
        message.value = 'Please select a product.';
        return;
    }

    try {
        loading.value = true;
        showFormDialog.value = false;
        tableLoading.value = true;

        const payload = { set_limit: newLimit, id: selectedProduct.value?.id };
        const response = await makeApiCall<SetLimitResponse>(
            'POST',
            `/store-items/${selectedProduct.value?.id}/set-limit`,
            payload
        );

        if (response?.data?.storeItem) {
            selectedProduct.value.set_limit = response.data.storeItem.set_limit;
            await fetchProducts();
            message.value = `Sales limit ${newLimit === null ? 'removed' : 'assigned'} successfully!`;
        } else {
            console.error('Unexpected response:', response);
        }
    } catch (error) {
        console.error('Error updating sales limit:', error);
        message.value = 'Error updating sales limit';
    } finally {
        loading.value = false;
        tableLoading.value = false;
        snackbar.value = true;
    }
};

// Handle Product Selection
const handleOptionSelected = (value: StoreItem) => {
    console.log('Selected Product:', value); // Debugging
    selectedProduct.value = value;
};


onMounted(fetchProducts);
</script>

<template>
    <v-container>
        <v-row>
            <v-col>
                <v-btn color="primary" @click="showFormDialog = true">Assign / Remove Sales Limit</v-btn>
            </v-col>
            <v-col>
                <v-text-field v-model="search" label="Search" prepend-inner-icon="mdi-magnify" />
            </v-col>
        </v-row>

        <v-card flat>
            <v-card-title class="d-flex align-center">
                Product List
                <v-spacer></v-spacer>
            </v-card-title>

            <div v-if="tableLoading" class="text-center" style="padding: 40px">
                <v-progress-circular indeterminate size="50" />
            </div>

            <v-data-table v-else
                :items="products.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))"
                :headers="headers" class="elevation-1">
                <template v-slot:item.sn="{ index }">
                    {{ index + 1 }}
                </template>
            </v-data-table>
        </v-card>

        <v-snackbar v-model="snackbar" timeout="3000" top>
            {{ message }}
        </v-snackbar>

        <v-dialog v-model="showFormDialog" persistent max-width="600px">
            <v-card>
                <v-card-title>Manage Sales Limit</v-card-title>
                <v-card-text>
               <filterSelect 
    :genericOptions="genericOptions" 
    :label_cus="'Product*'"
    @optionSelected="handleOptionSelected" 
    v-model="selectedProduct"
/> 


                    <v-text-field label="Sales Limit" v-model="setLimit" type="number"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" :loading="loading" @click="updateSalesLimit(setLimit)">Assign Sales
                        Limit</v-btn>
                    <v-btn color="error" :loading="loading" @click="updateSalesLimit(null)">Remove Sales Limit</v-btn>
                    <v-btn @click="showFormDialog = false">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>
