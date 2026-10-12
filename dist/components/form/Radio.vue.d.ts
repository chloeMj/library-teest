import { FieldValidator } from '../../composables/useFieldValidation';
import { ErrorPosition, LabelPosition, SelectOption } from '../../types/form';
type RadioDirection = 'vertical' | 'horizontal';
/** 원형 라디오(dot, 기본) 또는 토글 버튼처럼 보이는 스타일(button) */
type RadioVariant = 'dot' | 'button';
interface Props {
    modelValue?: string | number | null;
    options?: SelectOption[];
    label?: string;
    /** 'inside'는 라디오 그룹엔 의미가 없어 'top'처럼 동작합니다 */
    labelPosition?: LabelPosition;
    /** 옵션들을 세로로 쌓을지, 가로로 나열할지 */
    direction?: RadioDirection;
    variant?: RadioVariant;
    required?: boolean;
    errorPosition?: ErrorPosition;
    /** 내장 required 검증 외에 추가로 실행할 커스텀 검증 함수 */
    validator?: FieldValidator;
    disabled?: boolean;
    name?: string;
    id?: string;
}
declare var __VLS_1: {}, __VLS_3: {
    option: SelectOption;
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
    "update:modelValue": (value: string | number | null) => any;
    blur: (event: FocusEvent) => any;
}, string, import('vue').PublicProps, Readonly<Props> & Readonly<{
    "onUpdate:modelValue"?: ((value: string | number | null) => any) | undefined;
    onBlur?: ((event: FocusEvent) => any) | undefined;
}>, {
    disabled: boolean;
    labelPosition: LabelPosition;
    errorPosition: ErrorPosition;
    required: boolean;
    modelValue: string | number | null;
    options: SelectOption[];
    direction: RadioDirection;
    variant: RadioVariant;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
