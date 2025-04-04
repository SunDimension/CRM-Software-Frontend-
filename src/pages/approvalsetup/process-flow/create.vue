<script setup lang="ts">
import { makeApiCall } from '@/services/apiService';
import { ApprovalProcessFlow, ApprovalStage, ApprovalProcessModule } from '@/types/globalTypes';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';

// Define props
const props = defineProps<{
  approvalModules: ApprovalProcessModule[];
  approvalStages: ApprovalStage[];
}>();

const dialog = ref(false);
const emits = defineEmits(['created']);

const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    sequence_no(value: number) {
      if (value > 0) return true;
      return 'Sequence number must be greater than 0.';
    },
  },
});

const sequence_no = useField('sequence_no');
const process_module_id = useField('process_module_id');
const approval_stage_id = useField('approval_stage_id');
const status_id = useField('status_id');

const submit = handleSubmit((values) => {
  loading.value = true;

  const formData: ApprovalProcessFlow = {
    sequence_no: values.sequence_no,
    process_module_id: values.process_module_id.id,
    approval_stage_id: values.approval_stage_id.id,
    status_id: values.status_id.id,
  };

  makeApiCall<ApprovalProcessFlow>('POST', `/approval-process-flows`, formData)
    .then((response) => {
      console.log(response.data);
      emits('created');
      dialog.value = false;
    })
    .finally(() => {
      loading.value = false;
    });
});

const loading = ref(false);

</script>

<template>
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="600">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
          class="text-none font-weight-regular"
          color="success-darken-1"
          text="Add Approval Process Flow"
          variant="tonal"
          v-bind="activatorProps"
        ></v-btn>
      </template>

      <v-card title="Create Approval Process Flow">
        <v-card-text>
          <form @submit.prevent="submit">
            <v-text-field
              v-model="sequence_no.value.value"
              :error-messages="sequence_no.errorMessage.value"
              label="Sequence Number"
              required
            ></v-text-field>

            <v-combobox
              v-model="process_module_id.value.value"
              :items="props.approvalModules"
              item-title="name"
              item-value="id"
              label="Process Module"
              required
            ></v-combobox>

            <v-combobox
              v-model="approval_stage_id.value.value"
              :items="props.approvalStages"
              item-title="name"
              item-value="id"
              label="Approval Stage"
              required
            ></v-combobox>

            <v-combobox
              v-model="status_id.value.value"
              :items="[{ id: 1, name: 'Active' }, { id: 2, name: 'Inactive' }]"
              item-title="name"
              item-value="id"
              label="Status"
              required
            ></v-combobox>

            <v-spacer class="my-5"></v-spacer>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn text="Close" variant="plain" @click="dialog.value = false"></v-btn>

              <v-btn
                color="success-darken-1"
                type="submit"
                text="Create"
                variant="tonal"
                :loading="loading.value"
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
