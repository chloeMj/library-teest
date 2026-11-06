import { Component, Plugin } from 'vue';
import { default as Input } from './components/form/Input.vue';
import { default as Select } from './components/form/Select.vue';
import { default as Radio } from './components/form/Radio.vue';
import { default as Checkbox } from './components/form/Checkbox.vue';
import { default as Button } from './components/button/Button.vue';
import { default as Modal } from './components/modal/Modal.vue';
export declare const allComponents: Record<string, Component>;
export { Input as FmInput, Select as FmSelect, Radio as FmRadio, Checkbox as FmCheckbox, Button as FmButton, Modal as FmModal };
export type { LabelPosition, ErrorPosition, FieldVariant, SelectOption, OptionIcon } from './types/form';
export type { FieldValidator, FieldValue } from './composables/useFieldValidation';
declare const plugin: Plugin;
export default plugin;
declare module 'vue' {
    interface GlobalComponents {
        FmInput: typeof Input;
        FmSelect: typeof Select;
        FmRadio: typeof Radio;
        FmCheckbox: typeof Checkbox;
        FmButton: typeof Button;
        FmModal: typeof Modal;
    }
}
