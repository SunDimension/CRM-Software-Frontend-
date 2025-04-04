<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { GenericSetUp as Gs, InventoryItem, User } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';


import { ref } from 'vue';

// Define props
const props = defineProps<{
  roles: Gs[];
  statuses: Gs[];
  mode: 'create' | 'edit';
  prevValues?: User
}>();
const dialog = ref(false);
const apiError = ref<null|string>(null);
const emits = defineEmits(['updated']);
const permissions = [
    { name: 'Vendor Balances', create: false, edit: false, delete: false, view: false },
    { name: 'Vendor Balance Summary', create: false, edit: false, delete: false, view: false },
    { name: 'Bill Details', create: false, edit: false, delete: false, view: false },
    { name: 'Vendor Credit Details', create: false, edit: false, delete: false, view: false },
    { name: 'Payments Made', create: false, edit: false, delete: false, view: false },
    { name: 'Purchase Order Details', create: false, edit: false, delete: false, view: false },
    { name: 'Purchase Orders By Vendor', create: false, edit: false, delete: false, view: false },
    { name: 'Payable Summary', create: false, edit: false, delete: false, view: false },
    { name: 'Payable Details', create: false, edit: false, delete: false, view: false },
    { name: 'Purchases By Item', create: false, edit: false, delete: false, view: false },
    { name: 'Purchases By Category', create: false, edit: false, delete: false, view: false },
    { name: 'Purchase Receive Report', create: false, edit: false, delete: false, view: false },
    { name: 'System Mails', create: false, edit: false, delete: false, view: false },
    { name: 'Activity Logs', create: false, edit: false, delete: false, view: false },
    // Add more permissions as needed
];


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
  selectedRole: useField<Gs>('role'),
  selectedStatus: useField<Gs>('status'),
};

// console.log(props.states, props.countries)

const submit = handleSubmit((values) => {
  loading.value = true;
  apiError.value = null; 

  console.log('selectedState', fields)
  const formData: User = {
    name: fields.name.value.value,
    email: fields.email.value.value,
    role: fields.selectedRole.value.value.id??0,
  };

  if (props.mode === 'edit') {
    formData.status_id = fields.selectedStatus.value.value.id;
  }

  // alert(JSON.stringify(formData, null, 2));
  const method = props.mode ==='edit' ? 'PUT' : 'POST';
  const api_url = props.mode ==='edit' ? `/create-items/${props.prevValues?.id}` : '/create-items';

  // makeApiCall<InventoryItem>(method, api_url, formData).then((response) => {
  //   // console.log(response.data)
  //   emits('updated');
  //   dialog.value = false;
  // }).finally(() => {
  //   loading.value = false
  // })
  makeApiCall<InventoryItem>(method, api_url, formData)
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
  fields.selectedRole.value.value = props.roles.find(role => role.id === prevValues.role) || {} as Gs;
  fields.selectedStatus.value.value = props.roles.find(status => status.id === prevValues.status_id) || {} as Gs;
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
  'Role': 'selectedRole',
  'Status': 'selectedStatus',
};

const handleOptionSelected = (value: any, label: string) => {
  const fieldKey = labelFieldMap[label];
  if (fieldKey) {
    fields[fieldKey].value.value = value;
  } else {
    console.warn(`Unknown label: ${label}`);
  }
};

// onMounted( () => {
//   console.log('console.log----->',fields.selectedItemCategory.value.value)
// })

watch(
  () => dialog,
  (newPrevValues) => {
    // console.log('console.log modal oopeeeeeend-////---->', props.mode)
    if (props.mode === 'edit' && props.prevValues) {
      setPreviousValues(props.prevValues);
      // console.log('console.log modal oopeeeeeend inside if----->',props.prevValues)
    }
  },
  { immediate: true, deep: true } 
);
// watch(
//   () => fields.image_url.value.value, // Access the image URL correctly
//   (newImageUrl) => {
//     console.log("Image changed:", newImageUrl);
//     // Now you have the actual image URL, you can use it to display the image
//   },
//   { immediate: true }
// );

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
          :text="`Add Role`"
          variant="tonal"
          v-bind="activatorProps"
        ></v-btn>
        <v-btn v-if="props.mode=='edit'" v-bind="activatorProps" variant="plain" color="pending">
          <VIcon icon="ri-edit-line" color="warning"/>
        </v-btn>
      </template>

      <v-card
        :title="mode==='edit'?'Edit Role':'Create Role'"
      >
        <v-card-text>
          <form @submit.prevent="submit">
            <v-text-field
              v-model="fields.email.value.value"
              :counter="10"
              :error-messages="fields.email.errorMessage.value"
              label="Role Name"
              required
            ></v-text-field>
            <VRow class="mxt-5 mb-5">
              <vCol cols="12" v-if="props.mode==='edit'">
                <filterSelect 
                  :genericOptions="statuses" 
                  :label_cus="'Status'" 
                  @optionSelected="(item: Gs)=>handleOptionSelected(item,'Status')" 
                  :prevValue="props.mode === 'edit' ? fields.selectedStatus.value.value.id : null" 
                  :required="true"/>
              </vCol>
            </VRow>

            <div class="my-5">
              <div class="text-[#000] text-lg font-semibold">Permissions</div>
              <div v-for="(permission, index) in permissions" :key="permission.name">
                {{permission.name}}
                <v-row>
                  <v-col>
                    <v-checkbox
                      v-model="permission.create"
                      label="Create"
                    ></v-checkbox>
                  </v-col>
                  <v-col>
                    <v-checkbox
                      v-model="permission.edit"
                      label="Edit"
                    ></v-checkbox>
                  </v-col>
                  <v-col>
                    <v-checkbox
                      v-model="permission.delete"
                      label="Delete"
                    ></v-checkbox>
                  </v-col>
                  <v-col>
                    <v-checkbox
                      v-model="permission.view"
                      label="View"
                    ></v-checkbox>
                  </v-col>
                </v-row>
                <v-divider v-if="index !== permissions.length - 1" class="my-2"></v-divider>
              </div>
            </div>

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
                :text="props.mode==='edit'?'Update Role': 'Add Role'"
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
