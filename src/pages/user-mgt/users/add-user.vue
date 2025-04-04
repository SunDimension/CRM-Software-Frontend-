<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { Branch, GenericSetUp as Gs, Store, User, Warehouse } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';


import { ref } from 'vue';

// Define props
const props = defineProps<{
  roles: Gs[];
  statuses: Gs[];
  branches: Branch[];
  stores: Store[];
  warehouses: Warehouse[];
  mode: 'create' | 'edit';
  prevValues?: User
}>();
const dialog = ref(false);
const apiError = ref<null|string>(null);
const emits = defineEmits(['updated']);
const isPasswordVisible = ref(true);


const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    name (value :string) {
      if (value?.length >= 2) return true

      return 'Name needs to be at least 2 characters.'
    },
    // contact_person (value :string) {
    //   if (value?.length >= 2) return true

    //   return "Contact Person's Name needs to be at least 2 characters."
    // },
    // phone (value :string) {
    //   if (value?.length > 9 && /[0-9-]+/.test(value)) return true
    //   return 'Phone number needs to be at least 9 digits.'
    // },
    // email (value :string) {
    //   if (/^[a-z.-]+@[a-z.-]+\.[a-z]+$/i.test(value)) return true
    //   return 'Must be a valid e-mail.'
    // },

  },
})  




const fields = {
  name: useField<string>('name'),
  email: useField<string>('email'),
  password: useField<string>('password'),
 
  selectedStatus: useField<Gs>('status'),
  selectedWarehouse: useField<Warehouse>('warehouse'),
  selectedBranch: useField<Branch>('branch'),
  selectedStore: useField<Store>('store')
};

// console.log(props.states, props.countries)

const submit = handleSubmit((values) => {
  loading.value = true;
  apiError.value = null; 

  console.log('selectedState', fields)
  const formData: User = {
    name: fields.name.value.value,
    email: fields.email.value.value,
    password: fields.password.value.value,
    store_id: fields.selectedStore.value.value.id??0,
    // role: fields.selectedRole.value.value.id??0,
    branch_id: fields.selectedBranch.value.value.id??0,
    warehouse_id: fields.selectedWarehouse.value.value.id??0,
    status_id: fields.selectedStatus.value.value.id??0,
  };

  // if (props.mode === 'edit') {
  //   formData.status = fields.selectedStatus.value.value.id;
  // }

  // alert(JSON.stringify(formData, null, 2));
  const method = props.mode ==='edit' ? 'PUT' : 'POST';
  const api_url = props.mode ==='edit' ? `/users/${props.prevValues?.id}` : '/users';

  // makeApiCall<InventoryItem>(method, api_url, formData).then((response) => {
  //   // console.log(response.data)
  //   emits('updated');
  //   dialog.value = false;
  // }).finally(() => {
  //   loading.value = false
  // })
  makeApiCall<User>(method, api_url, formData)
    .then((response) => {
      emits('updated');
      // emits('itemUpdated', response.data); // Assuming your API returns the updated item
      dialog.value = false;
      // resetForm();
    })
    .catch((error) => {
      // Handle errors here
      if (error.response && error.response.data) {
        apiError.value = error.response.data.message || "An error occurred while processing your request.";
      } else {
        apiError.value = "An unexpected error occurred.";
      }
      
      // Emit an event to notify the parent component of the error
      // emits('itemUpdateFailed', apiError.value); 
    })
    .finally(() => {
      loading.value = false;
    });
})

const setPreviousValues = (prevValues: User) => {
  // console.log('prev values updated successfully...i think',  prevValues.item_type_id)
  fields.name.value.value = prevValues.name || '';
  fields.email.value.value = prevValues.email || '';
  // fields.image_url.value.value = prevValues.image_url || '';
  // fields.selectedRole.value.value = props.roles.find(role => role.id === prevValues.role) || {} as Gs;
  fields.selectedStatus.value.value =  prevValues.status_id? props.statuses.find(status => status.id === prevValues.status_id) || {} as Gs: {} as Gs;
  fields.selectedWarehouse.value.value = props.warehouses.find(status => status.id === prevValues.warehouse_id) || {} as Warehouse;
   fields.selectedStore.value.value = props.stores.find(status => status.id === prevValues.store_id) || {} as Store;
  fields.selectedBranch.value.value = prevValues.branch_id? props.branches.find(branch => branch.id === prevValues.branch_id) || {} as Branch: {} as Branch;
  // console.log('prev values updated successfully...i think',  fields.selectedBranch.value.value.id)
};
// console.log(props.prevValues)
// Initialize previous values if in edit mode
if (props.mode === 'edit' && props.prevValues) {
  setPreviousValues(props.prevValues);
}

const loading = ref(false);

type FieldKey = keyof typeof fields;
const labelFieldMap:Record<string, FieldKey> = {
  'Store': 'selectedStore',
  'Branch': 'selectedBranch',
  'Warehouse': 'selectedWarehouse',
  'Status': 'selectedStatus',
};

const handleOptionSelected = (value: any, label: string) => {
  const fieldKey = labelFieldMap[label];
  if (fieldKey) {
    fields[fieldKey].value.value = value;
    console.log('fields[fieldKey].value.value', value)
  } else {
    console.warn(`Unknown label: ${label}`);
  }
};

// onMounted( () => {
//   console.log('console.log----->',fields.selectedItemCategory.value.value)
// })

// watch(
//   () => dialog,
//   (newPrevValues) => {
//     // console.log('console.log modal oopeeeeeend-////---->', props.mode)
//     if (props.mode === 'edit' && props.prevValues) {
//       setPreviousValues(props.prevValues);
//       // console.log('console.log modal oopeeeeeend inside if----->',props.prevValues)
//     }
//   },
//   { immediate: true, deep: true } 
// );
// Initialize previous values if in edit mode
watch(
  () => dialog.value, // Ensure you're watching the correct reactive property
  () => {
    if (props.mode === 'edit' && props.prevValues) {
      nextTick(() => {
        if (props.prevValues) {  // Add a check to ensure prevValues is not undefined
          setPreviousValues(props.prevValues);
        }
      });
    }
  },
  { immediate: true, deep: true }
);

</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog
      v-model="dialog"
      max-width="600"
    >
    <template v-slot:activator="{ props: activatorProps }">
        <v-btn
          v-if="mode=='create'"
          class="text-none font-weight-regular"
          color="success-darken-1"
          prepend-icon=""
          :text="`Add User`"
          variant="tonal"
          v-bind="activatorProps"
        ></v-btn>
        <v-btn v-if="props.mode=='edit'" v-bind="activatorProps" variant="plain" color="pending">
          <VIcon icon="ri-edit-line" color="warning"/>
        </v-btn>
      </template>

      <v-card
        :title="mode==='edit'?'Edit User':'Create User'"
      >
        <v-card-text>
          <!--* form sample -->
          <form @submit.prevent="submit">
            <v-text-field
              v-model="fields.name.value.value"
              :counter="10"
              :error-messages="fields.name.errorMessage.value"
              label="Username"
              required
            ></v-text-field>
            <v-text-field
              v-model="fields.email.value.value"
              :counter="10"
              :error-messages="fields.email.errorMessage.value"
              label="Email"
              required
            ></v-text-field>
            <!-- <v-text-field
              v-model="fields.email.value.value"
              :counter="10"
              :error-messages="fields.email.errorMessage.value"
              label="Password"
              required
            ></v-text-field> -->
            <VRow class="mxt-5 mb-5">
              <!-- <vCol cols="12">
                <filterSelect :genericOptions="roles" :label_cus="'Branch'" @optionSelected="(item: Gs)=>handleOptionSelected(item,'Roles')" :prevValue="props.mode === 'edit' ? fields.selectedRole.value.value.id : null" :required="true"/>
                </vCol> -->
              <vCol cols="12">
                <VTextField
                  v-model="fields.password.value.value"
                  label="Password"
                  required
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />
              </vCol>
              <vCol cols="12">
                <filterSelect :genericOptions="branches" :label_cus="'Branch'" @optionSelected="(item: Branch)=>handleOptionSelected(item,'Branch')" :prevValue="props.mode === 'edit' && props.prevValues?.branch_id? fields.selectedBranch.value.value.id : null" :required="true"/>
              </vCol>
              <vCol cols="12">
                <filterSelect :genericOptions="warehouses" :label_cus="'Warehouse'" @optionSelected="(item: Warehouse)=>handleOptionSelected(item,'Warehouse')" :prevValue="props.mode === 'edit' && props.prevValues?.warehouse_id ? fields.selectedWarehouse.value.value.id : null" :required="true"/>
              </vCol>
              <vCol cols="12">
                <filterSelect :genericOptions="stores" :label_cus="'Store'" @optionSelected="(item: Store)=>handleOptionSelected(item,'Store')" :prevValue="props.mode === 'edit' && props.prevValues?.store_id ? fields.selectedStore.value.value.id : null" :required="true"/>
              </vCol>
              <vCol cols="12">
                <!-- <vCol cols="12" v-if="props.mode==='edit'"> -->
                <filterSelect :genericOptions="statuses" :label_cus="'Status'" @optionSelected="(item: Gs)=>handleOptionSelected(item,'Status')" :prevValue="props.mode === 'edit' && props.prevValues?.status_id ? fields.selectedStatus.value.value.id : null" :required="true"/>
              </vCol>
            </VRow>

            <v-spacer class="my-5"></v-spacer>

            <v-card-actions>
              <v-spacer></v-spacer>
    
              <v-btn
                text="Close"
                variant="plain"
                @click="dialog = false"
              ></v-btn>
    
              <v-btn
                color="success-darken-1"
                type="submit"
                :text="props.mode==='edit'?'Update Item': 'Add Item'"
                variant="tonal"
                :loading="loading"
              >
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
<!-- <script lang="ts">
  export default {
    data: () => ({
      dialog: false,
    }),
  }
</script> -->
