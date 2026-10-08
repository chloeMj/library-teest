import { Ref } from 'vue';
export type FieldValue = string | number | null | undefined;
/**
 * 커스텀 검증 함수.
 * 유효하면 null/undefined/true, 무효하면 에러 메시지(string) 또는 false를 반환합니다.
 */
export type FieldValidator<T = FieldValue> = (value: T) => string | boolean | null | undefined;
export interface UseFieldValidationOptions<T = FieldValue> {
    value: Ref<T>;
    type: Ref<string>;
    required?: Ref<boolean | undefined>;
    max?: Ref<number | undefined>;
    validator?: Ref<FieldValidator<T> | undefined>;
    /** blur 등으로 사용자가 필드를 건드렸는지 여부. false면 에러를 노출하지 않습니다. */
    touched: Ref<boolean>;
    /**
     * "값이 비어있다(=required 위반)"의 기준. 기본은 null/undefined/''.
     * Checkbox처럼 값 모양이 다른 컴포넌트는 직접 넘겨서 바꿀 수 있습니다.
     */
    isEmpty?: (value: T) => boolean;
}
/**
 * required / max(문자열 길이 또는 숫자 최대값) 내장 검증과, 사용자가 주입한
 * 커스텀 validator를 함께 평가해 에러 메시지 하나를 계산합니다.
 */
export declare function useFieldValidation<T = FieldValue>(options: UseFieldValidationOptions<T>): {
    errorMessage: import('vue').ComputedRef<string | null>;
};
