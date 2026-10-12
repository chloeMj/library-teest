import { FieldValidator } from '../../composables/useFieldValidation';
import { ErrorPosition, LabelPosition, SelectOption } from '../../types/form';
type CheckboxDirection = 'vertical' | 'horizontal';
/** 체크된 사각형(box, 기본) 또는 토글 버튼처럼 보이는 스타일(button) */
type CheckboxVariant = 'box' | 'button';
/** options를 생략하면 boolean 단일 체크박스, 주면 다중 선택 그룹 */
type CheckboxValue = boolean | (string | number)[];
interface Props {
    modelValue?: CheckboxValue;
    /** 지정하면 다중 선택 그룹(v-model: 배열), 생략하면 label 하나짜리 단일 체크박스(v-model: boolean) */
    options?: SelectOption[];
    label?: string;
    labelPosition?: LabelPosition;
    direction?: CheckboxDirection;
    variant?: CheckboxVariant;
    required?: boolean;
    errorPosition?: ErrorPosition;
    /** 내장 required 검증 외에 추가로 실행할 커스텀 검증 함수 */
    validator?: FieldValidator<CheckboxValue>;
    disabled?: boolean;
    name?: string;
    id?: string;
}
declare var __VLS_1: {}, __VLS_3: {
    option: SelectOption;
    index: number;
}, __VLS_5: {}, __VLS_7: {
    message: string;
};
type __VLS_Slots = {} & {
    label?: (props: typeof __VLS_1) => any;
} & {
    option?: (props: typeof __VLS_3) => any;
} & {
    empty?: (props: typeof __VLS_5) => any;
} & {
    error?: (props: typeof __VLS_7) => any;
};
declare const __VLS_base: import('vue').DefineComponent<Props, {
    validate: () => boolean;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: CheckboxValue) => any;
    blur: (event: FocusEvent) => any;
}, string, import('vue').PublicProps, Readonly<Props> & Readonly<{
    "onUpdate:modelValue"?: ((value: CheckboxValue) => any) | undefined;
    onBlur?: ((event: FocusEvent) => any) | undefined;
}>, {
    disabled: boolean;
    labelPosition: LabelPosition;
    errorPosition: ErrorPosition;
    required: boolean;
    modelValue: CheckboxValue;
    direction: CheckboxDirection;
    variant: CheckboxVariant;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
