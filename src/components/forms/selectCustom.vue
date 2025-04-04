<template>
  <v-select v-model="selectedOption" :items="props.genericOptions" item-title="name" item-value="id" :label=props.label_cus>
    <template v-slot:item="{ props, item }">
      <v-list-item v-bind="props"></v-list-item>
    </template>
  </v-select>
</template>
<script setup lang="ts">
import { GenericSetUp } from '@/types/globalTypes';
import { defineProps, ref, watch } from 'vue';

const emit = defineEmits(['optionSelected']);
const selectedOption = ref<number|null>(null);

// Define props
const props = defineProps<{
  genericOptions: GenericSetUp[];
  label_cus: string;
  prevValue?: number;
}>();

// watch and emit the new selection back to the parent compoennt
watch(selectedOption, (newVal) => {
  emit('optionSelected', newVal);
});

onMounted(() => {
  // console.log('props.prevValue--->', props.prevValue, props.label_cus, props.genericOptions);
  if (props.prevValue !== undefined) {
    selectedOption.value = props.prevValue as null | number;
    console.log('selectedOption.value--->', selectedOption.value)
  }
})

// console.log('props.genericOptions-->',props.label_cus)

</script>
