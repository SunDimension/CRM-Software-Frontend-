<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { Branch, GenericSetUp as Gs, Store, User, Warehouse } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';

import { ref } from 'vue';

// Define props
const props = defineProps<{
  roles: Gs[];
  prevValues: User
}>();
const dialog = ref(false);
const apiError = ref<null|string>(null);
const emits = defineEmits(['updated']);
const isPasswordVisible = ref(true);


const { handleSubmit, handleReset } = useForm({
  validationSchema: {

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
  const formData: any = {
    user_id: props.prevValues.id,
    roles: props.prevValues.roles
  };

  // if (props.mode === 'edit') {
  //   formData.status = fields.selectedStatus.value.value.id;
  // }

  // alert(JSON.stringify(formData, null, 2));
  const method =  'POST'
  const api_url =  `/users/${props.prevValues?.id}/roles/assign`


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
  
  // console.log('prev values updated successfully...i think',  fields.selectedBranch.value.value.id)
};
// console.log(props.prevValues)
// Initialize previous values if in edit mode

  // setPreviousValues(props.prevValues);

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

// Initialize previous values if in edit mode
watch(
  () => dialog.value, // Ensure you're watching the correct reactive property
  () => {
    // if (props.mode === 'edit' && props.prevValues) {
      nextTick(() => {
        if (props.prevValues) {  // Add a check to ensure prevValues is not undefined
          setPreviousValues(props.prevValues);
        }
      });
    
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
        
        <v-btn v-bind="activatorProps" variant="plain" color="pending">
          <VIcon icon="ri-edit-line" color="warning"/>
        </v-btn>
      </template>

      <v-card
        :title="'Edit User'"
      >
        <v-card-text>
          <!--* form sample -->
          <form @submit.prevent="submit">
            
            <v-spacer class="my-5"></v-spacer>

            <v-card-actions>
              <v-spacer></v-spacer>
              <VRow>

                <v-select
                v-model="prevValues.roles"
                :items="roles"
                item-value="id"
                item-title="name"
                label="Roles"
                multiple
                
                required
                >
              </v-select>
            </VRow>
              <v-btn
                text="Close"
                variant="plain"
                @click="dialog = false"
              ></v-btn>
    
              <v-btn
                color="success-darken-1"
                type="submit"
                :text="'Update Item'"
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
