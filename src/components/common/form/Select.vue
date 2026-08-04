<template>
  <q-btn-dropdown
    :class="['dropdown', type, { placeholder: label === placeholder }]"
    :menu-offset="type==='bank' ? [0, -3] : [0, 0]"
  >
    <template v-slot:label>
      <span v-if="icon" :class="['custom-prepend-icon', icon]"></span>
      <div class="block">
        {{ label }}
      </div>
    </template>
    <q-list class="dropdown-list" :class="type">
      <q-item
        v-for="(item, index) in options"
        :key="`drop-item-${index}`"
        :clickable="!item.disable"
        v-close-popup
        @click="() => onClickItem(item)"
      >
        <q-item-section>
          <q-item-label>{{ item.label }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>
<script lang="ts" setup>
// ===================================================
// 📦 Imports
// ===================================================
import { computed, onBeforeMount, ref, watch } from 'vue';

// ===================================================
// 📥 Props / Emits
// ===================================================
interface OptionType {
  label: string;
  value: string | number;
  disable?: boolean;
  placeholder?: boolean;
}

const props = withDefaults(
  defineProps<{
    label?: string;
    modelValue?: string | number | OptionType | null;
    options: string[] | OptionType[];
    disableAllOption?: boolean;
    type?: string;
    icon?: string;
    placeholder?: string;
  }>(),
  {
    disableAllOption: false,
    modelValue: null,
    options: () => [] as string[],
    type: 'basic',
  }
);
const emits = defineEmits(['change', 'update:modelValue']);

// ===================================================
// 📦 State
// ===================================================
const selectedValue = ref<OptionType | null>(null);

// ===================================================
// 🧮 Computed
// ===================================================
const options = computed(() => {
  const optionList = props.options.map((option: string | OptionType) => {
    return {
      label: option?.label || option,
      value: option?.value || option,
    };
  });

  if (
    !props.disableAllOption &&
    !props.options.find((opt: any) => {
      return opt.value === null || opt.value === '';
    })
  ) {
    optionList.unshift({
      label: '전체',
      value: null,
    });
  }
  return optionList;
});
const label = computed(() => {
  return (selectedValue.value?.value && selectedValue.value?.label ? selectedValue.value?.label : '') || props.label || props.placeholder || '';
});
const propsVal = computed(() => {
  return props.modelValue;
});

// ===================================================
// ⚙️ Methods
// ===================================================
const setModelValue = () => {
  selectedValue.value = props.modelValue
    ? options.value.find((option: OptionType) => {
        return option.value === props.modelValue;
      }) || null
    : null;
};

const onClickItem = (opt: OptionType) => {
  if (opt.disable) return;
  selectedValue.value = opt;
};

// ===================================================
// 👀 Watchers
// ===================================================
watch(propsVal, setModelValue);
watch(selectedValue, () => {
  emits('update:modelValue', selectedValue.value?.value || null);
  emits('change', selectedValue.value);
});

// ===================================================
// 🚀 Lifecycle Hooks
// ===================================================
onBeforeMount(() => {
  setModelValue();
});
</script>

<style lang="scss" scoped>
@use '@/css/components/form/select' as *;
</style>
