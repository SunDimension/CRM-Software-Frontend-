<template>
  <VRow class="mb-4">
    <Create :mode="'create'" @updated="handleUpdated" :permissions="permissions" />
  </VRow>

  <v-card flat>
    <VCard style="padding: 1.25rem;" elevation="0">
      <v-card-title class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
        Roles
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
    </VCard>

    <v-divider></v-divider>

    <v-data-table 
      :items="filteredData" 
      :headers="headers" 
      :loading="loading" 
      v-if="!loading"
      sticky-header
    >
      <template v-slot:item.permissions="{ item }">
        <v-chip-group>
          <v-chip 
            v-for="permission in item.permissions" 
            :key="permission.id" 
            color="blue-grey" 
            class="mr-1"
          >
            {{ permission.name }}
          </v-chip>
        </v-chip-group>
      </template>

      <template v-slot:item.actions="{ item }">
        <VRow justify="end" align="center" style="flex-wrap:nowrap">
          <Edit :mode="'edit'" @updated="handleUpdated" :role="item" :permissions="permissions" />
        </VRow>
      </template>
    </v-data-table>

    <div v-if="loading" class="text-center" style="padding: 40px">
      <v-progress-circular indeterminate size="180" />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { makeApiCall } from '@/services/apiService';
import { default as Create, default as Edit } from './add.vue';

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

const search = ref('');
const roles = ref<Role[]>([]);
const filteredData = ref<Role[]>([]);
const loading = ref(true);
const permissions = ref<Permission[]>([]);

// Define headers for the data table
const headers = [
  { text: 'S/N', value: 'sn' },
  { text: 'Role Name', value: 'name' },
  { text: 'Permissions', value: 'permissions' },
  { text: 'Actions', value: 'actions', sortable: false }
];

// Fetch roles and permissions from the API
const fetchData = async () => {
  try {
    loading.value = true;
    const [rolesResponse, permissionsResponse] = await Promise.all([
      makeApiCall<Role[]>('GET', '/roles'),
      makeApiCall<Permission[]>('GET', '/permissions') // Fetch permissions separately
    ]);

    roles.value = rolesResponse.data;
    permissions.value = permissionsResponse.data;
    filteredData.value = roles.value; // Initialize filtered data with all roles
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

// Filter roles based on search input
const handleFilter = () => {
  const searchTerm = search.value.toLowerCase();
  filteredData.value = roles.value.filter(role => 
    role.name.toLowerCase().includes(searchTerm) ||
    role.permissions.some(permission => permission.name.toLowerCase().includes(searchTerm))
  );
};

// Fetch roles and permissions when the component is mounted
onMounted(fetchData);

// Watch for changes in the search input to filter roles
watch(search, handleFilter);

// Handle updates after creating or editing roles
const handleUpdated = () => {
  fetchData(); // Refetch data
};

</script>

<style scoped>
/* Add any additional styles if necessary */
</style>
