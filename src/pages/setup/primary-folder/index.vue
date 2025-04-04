<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { PrimaryFolder } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { default as Create, default as Edit } from './add.vue';


interface GenericSetUp {
    id?: number
    name: string
}
// Reactive references
const search = ref('');
const currentPage = ref<number>(1);
const data = ref<PrimaryFolder[]>([]);
const filteredData = ref<PrimaryFolder[]>([]);
const companies = ref<GenericSetUp[]>([]);
const years = ref<GenericSetUp[]>([]);
const loading = ref(true);

// Headers for the v-data-table
const headers = ref([
    { title: 'S/N', key: 'sn' },
    { title: 'Folder Name', key: 'name' },
    { title: 'Company Name', key: 'company' },
    { title: 'Year Created', key: 'year' },
    { title: '', key: 'actions', sortable: false }
]);

// Define handleFilter outside of fetchData
const handleFilter = () => {
    filteredData.value = data.value.filter((PrimaryFolder) => {
        return PrimaryFolder.name.toLowerCase().includes(search.value.toLowerCase());
    });
};

const fetchData = async () => {
    try {
        loading.value = true;

        // Fetch companies and years first
        const companyResponse = await makeApiCall<GenericSetUp[]>('GET', '/companies');
        const yearResponse = await makeApiCall<GenericSetUp[]>('GET', '/years');

        // Assign the API data to ref variables
        companies.value = companyResponse.data;
        years.value = yearResponse.data;

        // Fetch primary folders with company_id (assuming the first company is selected by default)
        const selectedCompanyId = companies.value.length > 0 ? companies.value[0].id : null;
        if (!selectedCompanyId) {
            console.error("No company selected, cannot fetch primary folders.");
            return;
        } const primaryFolderResponse = await makeApiCall<PrimaryFolder[]>('GET', '/primary-folders', {
            params: {
                company_id: selectedCompanyId, // Pass the company_id
            },
        });

        // Process primary folder data
        data.value = primaryFolderResponse.data.map((PrimaryFolder: PrimaryFolder, index: number) => ({
            sn: index + 1,
            ...PrimaryFolder,
        }));

        // Call handleFilter after data is processed
        handleFilter();
    } catch (error) {
        console.error('Error fetching data:', error);
        // Consider adding user feedback for error
    } finally {
        loading.value = false;
    }
};

const handleUpdated = () => {
    fetchData();
};

onMounted(fetchData);
</script>

<template>
    <VRow class="mb-4">
        <Create :mode="'create'" @primaryFolderCreated="handleUpdated" :companies="companies" :years="years" />
    </VRow>

    <v-card flat>
        <v-card-title class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
            Primary Folder
            <v-spacer></v-spacer>
            <v-text-field v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
                variant="solo-filled" flat hide-details single-line></v-text-field>
        </v-card-title>

        <v-data-table :headers="headers" :items="filteredData" v-if="filteredData && !loading" sticky-header>
            <template v-slot:item.sn="{ index }">
                {{ index + 1 }}
            </template>

            <template v-slot:item.name="{ item }">
                {{ item.name ?? 'N/A' }}
            </template>

            <template v-slot:item.company="{ item }">
                {{companies.find(company => company.id === item.company_id)?.name ?? 'N/A'}}
            </template>

            <template v-slot:item.year="{ item }">
                {{years.find(y => y.id === item.year_id)?.name ?? 'N/A'}}
            </template>

            <template v-slot:item.actions="{ item }">
                <VRow justify="end" align="center" style="flex-wrap:nowrap">
                    <Edit :mode="'edit'" @primaryFolderCreated="handleUpdated" :companies="companies" :years="years"
                        :primaryFolder="item" />
                    <DeleteBtn :api="`/primary-folders/${item.id}`" :item_name="'primary folder'"
                        @deleted="handleUpdated" />
                </VRow>
            </template>
        </v-data-table>

        <div v-if="loading" colspan="6" class="text-center" style="padding: 40px">
            <v-progress-circular indeterminate size="180" />
        </div>
    </v-card>
</template>
