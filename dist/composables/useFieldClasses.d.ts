import { Ref } from 'vue';
import { ErrorPosition, LabelPosition } from '../types/form';
export interface UseFieldClassesOptions {
    /** BEM 블록명. 예: 'ui-input', 'ui-select' */
    block: string;
    labelPosition: Ref<LabelPosition>;
    errorPosition: Ref<ErrorPosition>;
    invalid: Ref<boolean>;
    disabled: Ref<boolean>;
    focused: Ref<boolean>;
    floated: Ref<boolean>;
}
/**
 * Input/Select 등 폼 필드류가 공통으로 쓰는 rootClasses/controlClasses.
 * BEM 블록명만 다르고 나머지 규칙(라벨 위치, 에러 위치, invalid/disabled,
 * control의 focused/floated)은 동일해서 여기서 한 번만 구현합니다.
 */
export declare function useFieldClasses(options: UseFieldClassesOptions): {
    rootClasses: import('vue').ComputedRef<(string | {
        [x: string]: boolean;
    })[]>;
    controlClasses: import('vue').ComputedRef<{
        [x: string]: boolean;
    }>;
};
