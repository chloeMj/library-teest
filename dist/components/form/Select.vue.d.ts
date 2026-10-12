import { FieldValidator } from '../../composables/useFieldValidation';
import { ErrorPosition, LabelPosition, SelectOption } from '../../types/form';
interface Props {
    modelValue?: string | number | null;
    options?: SelectOption[];
    label?: string;
    labelPosition?: LabelPosition;
    placeholder?: string;
    required?: boolean;
    errorPosition?: ErrorPosition;
    /** 내장 required 검증 외에 추가로 실행할 커스텀 검증 함수 */
    validator?: FieldValidator;
    disabled?: boolean;
    /** 검색어로 옵션을 필터링할 수 있는 콤보박스 모드 */
    searchable?: boolean;
    /** searchable일 때 검색 대상으로 볼 SelectOption의 필드명 목록 (기본: label, value) */
    filterKeys?: string[];
    /** 검색 매칭 로직을 완전히 직접 구현하고 싶을 때 사용. 지정하면 filterKeys는 무시됨 */
    filterOption?: (option: SelectOption, query: string) => boolean;
    /** 이 너비(px) 이하에서는 드롭다운 대신 bottomSheet로 열림 */
    mobileBreakpoint?: number;
    name?: string;
    id?: string;
}
declare var __VLS_1: {}, __VLS_3: {}, __VLS_5: {
    option: SelectOption;
}, __VLS_7: {}, __VLS_9: {
    message: string;
}, __VLS_23: {
    option: SelectOption;
}, __VLS_25: {};
type __VLS_Slots = {} & {
    label?: (props: typeof __VLS_1) => any;
} & {
    label?: (props: typeof __VLS_3) => any;
} & {
    option?: (props: typeof __VLS_5) => any;
} & {
    empty?: (props: typeof __VLS_7) => any;
} & {
    error?: (props: typeof __VLS_9) => any;
} & {
    option?: (props: typeof __VLS_23) => any;
} & {
    empty?: (props: typeof __VLS_25) => any;
};
declare const __VLS_base: import('vue').DefineComponent<Props, {
    focus: () => void | undefined;
    validate: () => boolean;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string | number | null) => any;
    focus: (event: FocusEvent) => any;
    blur: (event: FocusEvent) => any;
}, string, import('vue').PublicProps, Readonly<Props> & Readonly<{
    "onUpdate:modelValue"?: ((value: string | number | null) => any) | undefined;
    onFocus?: ((event: FocusEvent) => any) | undefined;
    onBlur?: ((event: FocusEvent) => any) | undefined;
}>, {
    disabled: boolean;
    labelPosition: LabelPosition;
    errorPosition: ErrorPosition;
    required: boolean;
    modelValue: string | number | null;
    options: SelectOption[];
    searchable: boolean;
    filterKeys: string[];
    mobileBreakpoint: number;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
