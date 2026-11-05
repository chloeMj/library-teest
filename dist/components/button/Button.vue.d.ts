/**
 * 모양. Input의 variant와 같은 단어를 같은 뜻으로 씁니다.
 *   filled   배경이 채워진 버튼. 화면의 핵심 동작 (저장, 다음)
 *   outlined 테두리만 있는 버튼. 보조 동작 (취소, 이전)
 *   ghost    배경·테두리 없이 hover 때만 배경. 툴바, 아이콘 버튼
 *   text     여백 없이 글자만, hover 때 밑줄. 문장 옆 "더보기", "비밀번호 찾기"
 */
type ButtonVariant = "filled" | "outlined" | "ghost" | "text";
/**
 * 색(의미). 모양과 자유롭게 조합합니다. 예) outlined + danger = 빨간 테두리 삭제 버튼
 *   primary 기본 동작
 *   neutral 강조하지 않는 동작 (취소, 닫기)
 *   danger  되돌리기 어려운 동작 (삭제, 탈퇴)
 */
type ButtonColor = "primary" | "neutral" | "danger";
type ButtonSize = "sm" | "md" | "lg";
/** vue-router의 RouteLocationRaw와 같은 모양. 라이브러리가 vue-router에 의존하지 않도록 직접 적습니다 */
type RouteTarget = string | Record<string, unknown>;
interface Props {
    variant?: ButtonVariant;
    color?: ButtonColor;
    /**
     * 표준 크기. 높이·여백 값은 tokens.scss의 --ui-button-height-* / --ui-button-padding-x-*.
     * 버튼 하나만 다른 크기가 필요하면 prop을 늘리지 말고 변수를 직접 주세요.
     * 예) <UiButton style="--ui-button-height: 52px; --ui-button-padding-x: 24px">
     */
    size?: ButtonSize;
    /**
     * HTML 기본값은 submit이라 form 안에서 누르면 의도치 않게 제출됩니다.
     * 그래서 기본값을 button으로 둡니다. 제출 버튼만 type="submit"을 주세요.
     * (href/to를 주면 링크가 되므로 이 값은 쓰이지 않습니다)
     */
    type?: "button" | "submit" | "reset";
    /** 주면 <a>로 렌더링됩니다. 외부 사이트·파일 다운로드 등 */
    href?: string;
    /** 링크를 새 탭에서 열 때 "_blank" */
    target?: string;
    /** 주면 vue-router의 <RouterLink>로 렌더링됩니다. 앱 안의 페이지 이동 */
    to?: RouteTarget;
    disabled?: boolean;
    /** 저장 중처럼 처리 중일 때. 스피너를 보여주고 다시 누르지 못하게 막습니다 */
    loading?: boolean;
    /** 부모 너비를 꽉 채웁니다 (모바일 하단 버튼 등) */
    block?: boolean;
    /**
     * 아이콘만 있는 정사각형 버튼. 글자가 없으므로 화면 낭독기용 이름을
     * 반드시 aria-label로 주세요. 예) <UiButton icon aria-label="닫기">✕</UiButton>
     */
    icon?: boolean;
}
declare var __VLS_10: {}, __VLS_12: {}, __VLS_14: {};
type __VLS_Slots = {} & {
    prefix?: (props: typeof __VLS_10) => any;
} & {
    default?: (props: typeof __VLS_12) => any;
} & {
    suffix?: (props: typeof __VLS_14) => any;
};
declare const __VLS_base: import('vue').DefineComponent<Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    click: (event: MouseEvent) => any;
}, string, import('vue').PublicProps, Readonly<Props> & Readonly<{
    onClick?: ((event: MouseEvent) => any) | undefined;
}>, {
    disabled: boolean;
    icon: boolean;
    block: boolean;
    type: "button" | "submit" | "reset";
    variant: ButtonVariant;
    color: ButtonColor;
    size: ButtonSize;
    loading: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
