<template>
  <div>
    <div :name="parentElName" class="search-combo-wrap">
      <q-input
        ref="inputEl"
        v-model="keyword"
        v-bind="$attrs"
        class="input"
        @focus="onFocusKeyword"
        @keydown="onKeydownKeyboard"
        @keyup="onKeyupKeyword"
      >
        <template v-slot:append>
          <q-icon
            v-if="keyword.length > 0"
            @click="onClearKeyword"
            class="icon-clear cursor-pointer"
          />
          <q-icon class="icon-search" @click="listVisible = true" />
        </template>
      </q-input>
      <div>
        <q-menu v-model="listVisible" no-focus no-refocus auto-close :menu-offset="[0, -2]" fit>
          <q-list class="dropdown-list combo" :style="{ width: inputWidth }">
            <template v-if="options.length > 0">
              <q-item
                v-for="(item, index) in options"
                :key="`drop-item-${index}`"
                :clickable="!item.disable"
                :active="activeItemIndex === index"
                v-close-popup
                @click="(e) => onClickItem(e, item)"
              >
                <q-item-section>
                  <q-item-label>{{ item.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-else>
              <q-item>
                <q-item-section>
                  <q-item-label class="text-center q-pa-md">항목이 없습니다.</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-menu>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
// ===================================================
// 📦 Imports
// ===================================================
import { computed, nextTick, onBeforeMount, onMounted, readonly, ref, useAttrs, watch } from 'vue'
import { util } from '@/plugins/util'

// ===================================================
// 📥 Props / Emits
// ===================================================
interface OptionType {
  label: string
  value: string | number
  disable?: boolean
  placeholder?: boolean
}

const props = withDefaults(
  defineProps<{
    options: string[] | OptionType[]
  }>(),
  {
    options: () => [] as string[]
  },
)
const emits = defineEmits(['change'])
const modelValue = defineModel<string | number | null>({ default: null })

// ===================================================
// 📦 State
// ===================================================
const inputEl = ref<any>(null)
const parentElName = ref<string>('')

const keyword = ref<string>('')
const listVisible = ref<boolean>(false)
const options = ref<any>([])
const activeItemIndex = ref<number | null>(null)
const selectedValue = ref<OptionType | null>(null)
const inputWidth = ref<string>('auto')

// ===================================================
// ⚙️ Methods
// ===================================================
// input 너비 가져오기
const updateInputWidth = () => {
  if (inputEl.value?.$el) {
    const width = inputEl.value.$el.offsetWidth
    inputWidth.value = `${width}px`
  }
}
const setSelectedOption = () => {
  const selectedOption = modelValue.value
    ? options.value.find((option: OptionType) => {
        return option.value === modelValue.value
      }) || {}
    : {}

  onClickItem(null, selectedOption)
}
const setOptionList = () => {
  options.value = props.options
    .filter((option: string | OptionType) => {
      if (!keyword.value.trim()) {
        return true
      }
      const label = option?.label || option
      const value = option?.value || option
      return label.includes(keyword.value.trim()) || value.includes(keyword.value.trim())
    })
    .map((option: string | OptionType) => {
      return {
        label: option?.label || option,
        value: option?.value || option,
      }
    })
}
const init = () => {
  if (props.options && props.options.length > 0) {
    keyword.value = modelValue.value ? String(modelValue.value) : ''

    setOptionList()
    nextTick(() => {
      setSelectedOption()
    })
  }
}
// ===================================================
// 🛠️ Actions
// ===================================================
const onFocusKeyword = async () => {
  listVisible.value = true
}

const keydownElParent = ref<string>('')
const onKeydownKeyboard = (evnt: KeyboardEvent) => {
  keydownElParent.value = parentElName.value
  setTimeout(() => {
    const existInComp = !!document.activeElement?.closest(`[name="${keydownElParent.value}"]`)
    if (!existInComp) {
      listVisible.value = false
    }
  }, 0)
}
const onKeyupKeyword = async (evnt: KeyboardEvent) => {
  setOptionList()
  await nextTick()

  listVisible.value = true

  if (evnt.key === 'ArrowDown' && options.value.length > 0) {
    if (activeItemIndex.value !== null && activeItemIndex.value < options.value.length - 1) {
      activeItemIndex.value += 1
    } else {
      activeItemIndex.value = 0
    }
    evnt.preventDefault()
  } else if (evnt.key === 'ArrowUp' && options.value.length > 0) {
    if (activeItemIndex.value && activeItemIndex.value > 0) {
      activeItemIndex.value -= 1
    } else {
      activeItemIndex.value = options.value.length - 1
    }

    evnt.preventDefault()
  } else if (evnt.key === 'Enter' && activeItemIndex.value !== null) {
    onClickItem(null, options.value[activeItemIndex.value])

    evnt.preventDefault()
  }
}
const onClearKeyword = () => {
  keyword.value = ''
  selectedValue.value = null

  inputEl.value.nativeEl?.focus()
  listVisible.value = true
}

const onClickItem = (evnt: Event | null, opt: OptionType) => {
  if (opt.disable) return

  keyword.value = opt?.label || ''
  selectedValue.value = opt?.value ? opt : null
  listVisible.value = false

  emits('change', opt)
}

// ===================================================
// 👀 Watchers
// ===================================================
watch(selectedValue, () => {
  modelValue.value = selectedValue.value?.value || null
  // emits('update:modelValue', selectedValue.value?.value)
  emits('change', selectedValue.value)
})

watch(listVisible, (val) => {
  activeItemIndex.value = null
  if (val) {
    nextTick(() => {
      updateInputWidth()
    })
  } else {
    if (selectedValue.value && selectedValue.value?.label.includes(keyword.value)) {
      keyword.value = selectedValue.value?.label || ''
    } else {
      keyword.value = ''
      selectedValue.value = null
    }
  }
})

watch(
  () => props.options,
  () => {
    init()
  },
  { deep: true },
)
watch(modelValue, () => {
  init()
})
// ===================================================
// 🚀 Lifecycle Hooks
// ===================================================
onBeforeMount(() => {
  parentElName.value = util.generateUUID()
  init()
})

onMounted(() => {
  updateInputWidth()
})
</script>

<style lang="scss" scoped>
@use '@/css/components/form/select' as *;
</style>
