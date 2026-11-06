type ModalSize = "sm" | "md" | "lg";
interface Props {
    /** 열림 여부. v-model로 씁니다 */
    modelValue?: boolean;
    /** 제목. #header 슬롯을 쓰면 무시됩니다 */
    title?: string;
    /**
     * 너비. 값은 --fm-modal-width-sm/md/lg(400/560/800px)로 바꿀 수 있고,
     * 모달 하나만 다르게 하려면 style="--fm-modal-width: 640px"를 주세요.
     */
    size?: ModalSize;
    /** 바깥(어두운 배경)을 누르면 닫기. 입력 중인 내용이 있는 모달은 false를 권장합니다 */
    closeOnBackdrop?: boolean;
    /** Esc 키로 닫기 */
    closeOnEsc?: boolean;
    /** 오른쪽 위 닫기(✕) 버튼 숨기기 */
    hideClose?: boolean;
}
declare var __VLS_15: {}, __VLS_25: {}, __VLS_27: {
    close: () => void;
};
type __VLS_Slots = {} & {
    header?: (props: typeof __VLS_15) => any;
} & {
    default?: (props: typeof __VLS_25) => any;
} & {
    footer?: (props: typeof __VLS_27) => any;
};
declare const __VLS_base: import('vue').DefineComponent<Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: boolean) => any;
    close: () => any;
    open: () => any;
}, string, import('vue').PublicProps, Readonly<Props> & Readonly<{
    "onUpdate:modelValue"?: ((value: boolean) => any) | undefined;
    onClose?: (() => any) | undefined;
    onOpen?: (() => any) | undefined;
}>, {
    modelValue: boolean;
    size: ModalSize;
    closeOnBackdrop: boolean;
    closeOnEsc: boolean;
    hideClose: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
