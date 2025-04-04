<script setup lang="ts">
import { capitalize_cus } from '@/filters';
import { makeApiCall } from '@/services/apiService';
import { Branch, GenericSetUp } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';

import { ref } from 'vue';

const dialog = ref(false);
const props = defineProps<{
  item_name: string;
  item_obj?: GenericSetUp;
  api_route: string;
  mode: 'create' | 'edit';
}>();

const emits = defineEmits(['created']);
let mtd = props.mode=='create'? 'POST' : 'PUT';
type HttpMethod = 'POST' | 'PUT' | 'GET' | 'DELETE'
// console.log('mtd--->', mtd)


const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    name (value :string) {
      if (value?.length >= 2) return true

      return 'Name needs to be at least 2 characters.'
    }
  },
})

const name = useField('name');
// props.mode === 'edit'? name.value.value = props.item_obj?.name: '';
watch(() => props.item_obj, (newVal) => {
  if (props.mode === 'edit' && newVal) {
    name.value.value = newVal.name;
  }
}, { immediate: true });

// console.log('props.item_obj---->', props.item_obj,  name.value.value )

const submit = handleSubmit((values) => {
  loading.value = true;
  
  const formData: GenericSetUp = {
    name: values.name
  };

  console.log("Submitting Data:", formData); // Debugging Log

  makeApiCall<Branch>(mtd as HttpMethod, props.api_route, formData)
    .then((response) => {
      console.log("API Response:", response); // Debugging Log
      emits('created');
      dialog.value = false;
    })
    .catch((error) => console.error("API Error:", error)) // Debugging Log
    .finally(() => loading.value = false);
});


const loading = ref(false)





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
          :text="`Add ${capitalize_cus(props.item_name)}`"
          variant="tonal"
          v-bind="activatorProps"
        ></v-btn>
        <v-btn v-if="mode=='edit'" v-bind="activatorProps" variant="plain" color="pending">
        <VIcon icon="ri-edit-line" color="warning"/>
      </v-btn>
      </template>

      <v-card
        :title="`Create ${capitalize_cus(props.item_name)}`"
      >
        <v-card-text>
          <!--* form sample -->
            <form @submit.prevent="submit">
              <v-text-field
                v-model="name.value.value"
                :counter="10"
                :error-messages="name.errorMessage.value"
                :label="`${capitalize_cus(item_name)} Name*`"
                  required
              ></v-text-field>
              <v-spacer class="my-5"></v-spacer>

              <v-card-actions>
                <v-spacer></v-spacer>
      
               <v-btn text="Close" variant="plain" @click="dialog = false; handleReset();"></v-btn>

      
                <v-btn
                  color="success-darken-1"
                  type="submit"
                  :text="props.mode === 'create'? 'Create': 'Update'"
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
<script lang="ts">
  export default {
    data: () => ({
      dialog: false,
    }),
  }
</script>
