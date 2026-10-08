import { Ref } from 'vue';
/**
 * labelPosition="inside" 케이스에서 focus 여부/입력값 존재 여부에 따라
 * 라벨이 축소·이동(floating)해야 하는지를 계산합니다.
 */
export declare function useFloatingLabel(value: Ref<string | number | null | undefined>): {
    isFocused: Ref<boolean, boolean>;
    hasValue: import('vue').ComputedRef<boolean>;
    isFloated: import('vue').ComputedRef<boolean>;
    onFocus: () => void;
    onBlur: () => void;
};
