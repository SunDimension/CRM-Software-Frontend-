<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { GenericSetUp, PrimaryFolder, Subfolder } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { default as Create, default as Edit } from './add.vue';



// Reactive references
const search = ref('');
const currentPage = ref<number>(1);
const data = ref<Subfolder[]>([]);
const filteredData = ref<Subfolder[]>([]);
const primaryFolder = ref<PrimaryFolder[]>([]);
// const years = ref<GenericSetUp[]>([]);
// const branches = ref<Branch[]>([]);
const loading = ref(true);

// Headers for the v-data-table
const headers = ref([
    { title: 'S/N', key: 'sn' },
    { title: 'Sub Folder', key: 'name' },
       { title: 'Company Name', key: 'company_name' }, // Add company name column
    { title: 'Primary Folder', key: 'primary_folder_name' },
    // { title: 'Year Created', key: 'year' },
    { title: 'Action', key: 'actions', sortable: false }
]);

const fetchData = async () => {
    try {
        loading.value = true;
        const SubfolderResponse = await makeApiCall<Subfolder[]>('GET', '/subfolders');
        const primaryFolderResponse = await makeApiCall<PrimaryFolder[]>('GET', '/primary-folders');
        // const yearResponse = await makeApiCall<GenericSetUp[]>('GET', '/years');

        // Assign the API data to ref variables
        primaryFolder.value = primaryFolderResponse.data;
        // years.value = yearResponse.data;

        // Process store data
        data.value = SubfolderResponse.data.map((Subfolder: Subfolder, index: number) => ({
            sn: index + 1,
            ...Subfolder,
        }));

        handleFilter();
    } catch (error) {
        console.error('Error fetching data:', error);
        // Consider adding user feedback for error
    } finally {
        loading.value = false;
    }
};

const handleFilter = () => {
    filteredData.value = data.value.filter((Subfolder) => {
        return Subfolder.name.toLowerCase().includes(search.value.toLowerCase());
    });
};

const handleUpdated = () => {
    fetchData();
};

onMounted(fetchData);
</script>

<template>
    <VRow class="mb-4">
        <Create :mode="'create'" @SubfolderCreated="handleUpdated" :primaryFolder="primaryFolder"  />
    </VRow>

    <v-card flat>
        <v-card-title class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
            Sub Folder
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

            <template v-slot:item.company_name="{ item }">
    {{ item.company_name ?? 'N/A' }}
</template>

            <template v-slot:item.primaryFolder="{ item }">
                {{primaryFolder.find(primaryFolder => primaryFolder.id === item.primary_folder_id)?.name ?? 'N/A'}}
            </template>

            <!-- <template v-slot:item.year="{ item }">
                {{years.find(y => y.id === item.year_id)?.name ?? 'N/A'}}
            </template> -->

            <template v-slot:item.actions="{ item }">
                <VRow justify="end" align="center" style="flex-wrap:nowrap">
                    <Edit :mode="'edit'" @SubfolderCreated="handleUpdated" :primaryFolder="primaryFolder" 
                        :Subfolder="item" />
                    <DeleteBtn :api="`/subfolders/${item.id}`" :item_name="'primary folder'"
                        @deleted="handleUpdated" />
                </VRow>
            </template>
        </v-data-table>

        <div v-if="loading" colspan="6" class="text-center" style="padding: 40px">
            <v-progress-circular indeterminate size="180" />
        </div>
    </v-card>
</template>
