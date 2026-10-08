import { Component, Plugin } from 'vue';
import { default as Input } from './components/form/Input.vue';
import { default as Select } from './components/form/Select.vue';
import { default as Radio } from './components/form/Radio.vue';
import { default as Checkbox } from './components/form/Checkbox.vue';
export declare const allComponents: Record<string, Component>;
export { Input as UiInput, Select as UiSelect, Radio as UiRadio, Checkbox as UiCheckbox };
export type { LabelPosition, ErrorPosition, SelectOption, OptionIcon } from './types/form';
export type { FieldValidator, FieldValue } from './composables/useFieldValidation';
declare const plugin: Plugin;
export default plugin;
declare module 'vue' {
    interface GlobalComponents {
        UiInput: typeof Input;
        UiSelect: typeof Select;
        UiRadio: typeof Radio;
        UiCheckbox: typeof Checkbox;
    }
}
