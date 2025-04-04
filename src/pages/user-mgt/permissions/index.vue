<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { Permission } from '@/types/globalTypes'; // Update this path as necessary
import { onMounted, ref } from 'vue';
import { default as Create, default as Edit } from './add.vue'; // Default imports for Create and Edit
// import DeleteBtn from './DeleteBtn.vue'; // Component for deleting permissions

// Reactive references
const search = ref('');
const currentPage = ref<number>(1);
const data = ref<Permission[]>([]);
const filteredData = ref<Permission[]>([]);
const loading = ref(true);

// Headers for the v-data-table
const headers = ref([
  { title: 'S/N', key: 'sn' },
  { title: 'Permission Name', key: 'name' },
  { title: '', key: 'actions', sortable: false }
]);

const fetchData = async () => {
  try {
    loading.value = true;
    const permissionResponse = await makeApiCall<Permission[]>('GET', '/permissions');

    // Process permission data
    data.value = permissionResponse.data.map((permission: Permission, index: number) => ({
      sn: index + 1,
      ...permission,
    }));

    handleFilter();
  } catch (error) {
    console.error('Error fetching permissions:', error);
    // Consider adding user feedback for error
  } finally {
    loading.value = false;
  }
};

const handleFilter = () => {
  filteredData.value = data.value.filter((permission) => {
    return permission.name.toLowerCase().includes(search.value.toLowerCase());
  });
};

const handleUpdated = () => {
  fetchData();
};

onMounted(fetchData);
</script>

<template>
  <VRow class="mb-4">
    <Create  :mode="'create'" @permissionCreated="handleUpdated"
     />
  </VRow>

  <v-card flat>
    <v-card-title class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
      Permissions
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        density="compact"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        flat
        hide-details
        single-line
      ></v-text-field>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="filteredData"
      v-if="filteredData && !loading"
      sticky-header
    >
      <template v-slot:item.sn="{ index }">
        {{ index + 1 }}
      </template>

      <template v-slot:item.name="{ item }">
        {{ item.name ?? 'N/A' }}
      </template>

      <template v-slot:item.actions="{ item }">
        <VRow justify="end" align="center" style="flex-wrap: nowrap">
          <Edit :mode="'edit'" @permissionUpdated="handleUpdated" :permission="item" />
          <DeleteBtn :api="`/permissions/${item.id}`" :item_name="'Permission'" @deleted="handleUpdated" />
        </VRow>
      </template>
    </v-data-table>

    <div v-if="loading" colspan="3" class="text-center" style="padding: 40px">
      <v-progress-circular indeterminate size="180" />
    </div>
  </v-card>
</template>
