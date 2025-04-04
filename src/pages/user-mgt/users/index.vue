<script setup lang="ts">
import { assignRole, makeApiCall, removeRole } from '@/services/apiService';
import { Branch, GenericSetUp as Gs, Role, Store, User, Warehouse } from '@/types/globalTypes';
import { onMounted, ref } from 'vue';
import { default as Create, default as Edit } from './add-user.vue';
import { default as RoleUpdate } from './roles.vue';

interface TableItem extends User {
  statusName: string;
}

const search = ref('');
const currentPage = ref<number>(1);
const data = ref<TableItem[]>([]);
const filteredData = ref<TableItem[]>([]);
const users = ref<User[]>([]);
const roles = ref<Role[]>([]);
const statuses = ref<Gs[]>([]);
const warehouses = ref<Warehouse[]>([]);
const branches = ref<Branch[]>([]);
const stores = ref<Store[]>([]);
const warehouseNameMap = ref<Record<number, string>>({});
const branchNameMap = ref<Record<number, string>>({});
const roleNameMap = ref<Record<number, string>>({});
const statusNameMap = ref<Record<number, string>>({});
const storeNameMap = ref<Record<number, string>>({});
const loading = ref(true);

const headers = [
  { title: 'S/N', key: 'sn' }, 
  { title: 'Username', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Roles', key: 'roles', sortable: false }, // Updated header for roles
  { title: '', key: 'actions', sortable: false }
];

const fetchData = async () => {
  try {
    loading.value = true;
    const [
      userResponse,
      roleResponse,
      statusResponse,
      branchResponse,
      warehouseResponse,
      storeResponse,
    ] = await Promise.all([
      makeApiCall<User[]>('GET', '/users'),
      makeApiCall<Role[]>('GET', '/roles'),
      makeApiCall<Gs[]>('GET', '/statuses'),
      makeApiCall<Branch[]>('GET', '/branches'),
      makeApiCall<Warehouse[]>('GET', '/warehouses'),
      makeApiCall<Store[]>('GET', '/stores'),
    ]);

    

    users.value = userResponse.data;
    roles.value = roleResponse.data;
    statuses.value = statusResponse.data;
    branches.value = branchResponse.data;
    warehouses.value = warehouseResponse.data;
    stores.value = storeResponse.data;

    roleNameMap.value = roles.value.reduce((map, role) => {
      if (role.id) map[role.id] = role.name;
      return map;
    }, {} as Record<number, string>);

    statusNameMap.value = statuses.value.reduce((map, status) => {
      if (status.id) map[status.id] = status.name;
      return map;
    }, {} as Record<number, string>);

    branchNameMap.value = branches.value.reduce((map, item) => {
      if (item.id) map[item.id] = item.name;
      return map;
    }, {} as Record<number, string>);

    warehouseNameMap.value = warehouses.value.reduce((map, item) => {
      if (item.id) map[item.id] = item.name;
      return map;
    }, {} as Record<number, string>);

    storeNameMap.value = stores.value.reduce((map, item) => {
      if (item.id) map[item.id] = item.name;
      return map;
    }, {} as Record<number, string>);

    // Populate data for display, using existing roles from the user object
    data.value = userResponse.data.map((item: User, index: number) => ({
      sn: index + 1,
      ...item,
      statusName: statusNameMap.value[item.status_id ?? 0],
    }));

    handleFilter();
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};


onMounted(fetchData);

const handleFilter = (item?: any, type: 'search' | '' = '') => {
  const searchTerm = search.value.toLowerCase();
  switch (type) {
    case 'search':
      return (filteredData.value = data.value.filter(item_ => 
        item_.name && item_.name.toLowerCase().includes(searchTerm) // Check if name exists
      ));
    default:
      return (filteredData.value = data.value);
  }
};
// const item = ref<User>({ id: 0, roles: [] }); // Initialize roles as an empty array
// const roles = ref([]);
const assignUserRole = async (userId: number, roleId: number) => {
  try {
    await assignRole(userId, roleId);
    fetchData(); // Refresh user list
  } catch (error) {
    console.error('Error assigning role:', error);
  }
};

const removeUserRole = async (userId: number, roleId: number) => {
  try {
    await removeRole(userId, roleId);
    fetchData(); // Refresh user list
  } catch (error) {
    console.error('Error removing role:', error);
  }
};



const getRoleName = (roleId: number): string => {
  const role = roles.value.find(r => r.id === roleId);
  return role ? role.name : 'Unknown Role'; // Fallback for undefined role
};

const handleUpdated = (item: any) => {
  fetchData();
};

</script>

<template>
  <VRow class="mb-4">
    <Create :mode="'create'" @updated="handleUpdated" 
      :roles="roles"
      :statuses="statuses"
      :warehouses="warehouses"
      :branches="branches"
      :stores="stores"
    />
  </VRow>
  <v-card flat>
    <VCard style="padding: 1.25rem;" elevation="0">
      <v-card-title class="d-flex align-center pe-2" style="padding-block-end: 1.25rem;">
        Users
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

    <v-data-table v-model:search="search" v-model:page="currentPage" :items="filteredData" :headers="headers" v-if="filteredData && !loading" sticky-header>
      <template v-slot:item.roles="{ item }">
        <v-chip-group>
          <v-chip 
            v-for="role in item.roles" 
            :key="role.id" 
            color="blue-grey" 
            class="mr-1"
          >
            {{ role?.name }}
          </v-chip>
        </v-chip-group>
      </template>

      <template v-slot:item.actions="{ item }">
        
        <VRow justify="end" align="center" style="flex-wrap:nowrap">
          <Edit :mode="'edit'" @updated="handleUpdated"
            :roles="roles"
            :statuses="statuses"
            :branches="branches"
            :warehouses="warehouses"
            :stores="stores"
            :prevValues="{...item}"
          />

          <RoleUpdate @updated="handleUpdated"
            :roles="roles"
            :prevValues="item"
          />
          <!-- Role assignment UI -->
      
          <DeleteBtn :api="`create-items/${item.id}`" :item_name="'User'" @deleted="handleUpdated"/>
        </VRow>
      </template>
    </v-data-table>

    <div v-if="loading" colspan="9" class="text-center" style="padding: 40px">
      <v-progress-circular indeterminate size="180" />
    </div>
  </v-card>
</template>
