import { FieldValidator } from '../../composables/useFieldValidation';
import { ErrorPosition, LabelPosition } from '../../types/form';
type InputType = 'text' | 'number' | 'email' | 'password' | 'tel' | 'search';
interface Props {
    modelValue?: string | number | null;
    type?: InputType;
    label?: string;
    labelPosition?: LabelPosition;
    placeholder?: string;
    required?: boolean;
    /** 문자열 입력이면 최대 글자 수, type="number"면 최댓값 */
    max?: number;
    /** type="number"에서만 사용 (스테퍼 하한, 네이티브 min 속성) */
    min?: number;
    /** type="number" + showStepper에서 한 번에 증감할 값 */
    step?: number;
    /** type="number"일 때만 의미 있는 증감 버튼 노출 여부 */
    showStepper?: boolean;
    errorPosition?: ErrorPosition;
    /** 내장 required/max 검증 외에 추가로 실행할 커스텀 검증 함수 */
    validator?: FieldValidator;
    disabled?: boolean;
    readonly?: boolean;
    name?: string;
    id?: string;
}
declare var __VLS_1: {}, __VLS_3: {}, __VLS_5: {}, __VLS_7: {}, __VLS_9: {
    message: string;
};
type __VLS_Slots = {} & {
    label?: (props: typeof __VLS_1) => any;
} & {
    prefix?: (props: typeof __VLS_3) => any;
} & {
    label?: (props: typeof __VLS_5) => any;
} & {
    suffix?: (props: typeof __VLS_7) => any;
} & {
    error?: (props: typeof __VLS_9) => any;
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
    type: InputType;
    required: boolean;
    modelValue: string | number | null;
    step: number;
    showStepper: boolean;
    readonly: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
