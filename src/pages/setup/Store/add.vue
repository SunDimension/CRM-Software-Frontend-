<script setup lang="ts">
import filterSelect from '@/components/forms/selectCustomWithFilter.vue';
import { makeApiCall } from '@/services/apiService';
import { GenericSetUp as Gs, Store, Branch } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref, watch } from 'vue';

// Define props
const props = defineProps<{
  branches: Branch[];
  storeTypes: Gs[];
  mode: 'create' | 'edit';
  store?: Store; // Optional prop for edit mode
}>();

const dialog = ref(false);
const apiError = ref<string | null>(null);
const emits = defineEmits(['storeCreated']);

const { handleSubmit } = useForm({
  validationSchema: {
    name(value: string) {
      if (value && value.trim() !== '') return true;
      return 'Store Name is required.';
    },
 
  },
});

// Fields
const name = useField('name');
const branch = useField('branch');
const store_type = useField('store_type');

const selectedBranch = ref<Gs | null>(null);
const selectedStoreType = ref<Gs | null>(null);

const loading = ref(false);

// Load data for edit mode if necessary
const loadDataForEdit = () => {
  if (props.mode === 'edit' && props.store) {
    const store = props.store;

    name.value.value = store.name;
    selectedBranch.value = props.branches.find((item) => item.id === store.branch_id) ?? null;
    selectedStoreType.value = props.storeTypes.find((item) => item.id === store.store_type_id) ?? null;
  }
};

// Watch for changes in props to update form data
watch(() => props.store, loadDataForEdit, { immediate: true });

const handleOptionSelected = (value: any, label: string) => {
  if (label === 'Branch') {
    selectedBranch.value = value;
  } else if (label === 'Store Type') {
    selectedStoreType.value = value;
  }
};

const submit = handleSubmit((values) => {
  loading.value = true;
  apiError.value = null;

  const formData: Store = {
    name: values.name,
    branch_id: selectedBranch.value?.id ?? 0,
    store_type_id: selectedStoreType.value?.id ?? 0,
  };

  const apiMethod = props.mode === 'edit' ? 'PUT' : 'POST';
  const apiUrl = props.mode === 'edit' ? `/stores/${props.store?.id}` : `/stores`;

  makeApiCall<Store>(apiMethod, apiUrl, formData)
    .then(() => {
      emits('storeCreated');
      dialog.value = false;
    })
    .catch(() => {
      apiError.value = "An unexpected error occurred.";
    })
    .finally(() => {
      loading.value = false;
    });
});
</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="800">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
          v-if="mode === 'create'"
          class="text-none font-weight-regular"
          color="success-darken-1"
          :text="`Create Store`"
          variant="tonal"
          v-bind="activatorProps"
        ></v-btn>
        <v-btn
          v-if="mode === 'edit'"
          v-bind="activatorProps"
          variant="plain"
          color="pending"
        >
          <VIcon icon="ri-edit-line" color="warning" />
        </v-btn>
      </template>

      <v-card :title="mode === 'edit' ? 'Edit Store' : 'Create Store'">
        <v-card-text>
          <form @submit.prevent="submit">
            <v-container fluid>
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="name.value.value"
                    :error-messages="name.errorMessage.value"
                    label="Store Name*"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <filterSelect
                    :genericOptions="branches"
                    :label_cus="'Branch*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Branch')"
                    v-model="selectedBranch"
                  />
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <filterSelect
                    :genericOptions="storeTypes"
                    :label_cus="'Store Type*'"
                    @optionSelected="(item) => handleOptionSelected(item, 'Store Type')"
                    v-model="selectedStoreType"
                  />
                </v-col>
              </v-row>
            </v-container>

            <!-- Error Message Display -->
            <div v-if="apiError" class="text-error">
              {{ apiError }}
            </div>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>

              <v-btn
                color="success-darken-1"
                type="submit"
                :text="mode === 'edit' ? 'Update Store' : 'Create Store'"
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
