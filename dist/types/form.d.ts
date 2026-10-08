/** 라벨 위치 variant: 위 / 왼쪽 / 내부(floating) */
export type LabelPosition = 'top' | 'left' | 'inside';
/** 에러 메시지 위치 variant */
export type ErrorPosition = 'top' | 'bottom';
/**
 * 옵션 아이콘: 이모지/짧은 텍스트(string) 또는 이미지(src/alt 객체).
 * 둘 다 아니라 아이콘 컴포넌트 등 완전한 커스텀이 필요하면 #option 슬롯을 쓰세요.
 */
export type OptionIcon = string | {
    src: string;
    alt?: string;
};
export declare const isImageIcon: (icon: OptionIcon) => icon is {
    src: string;
    alt?: string;
};
/**
 * Select/Radio/Checkbox 등에서 쓰는 옵션 항목.
 * label/value 외에 검색(filterKeys)에 쓸 임의의 필드를 자유롭게 추가할 수 있습니다.
 * (예: { label: '대한민국', value: 'kr', keywords: 'korea republic' })
 */
export interface SelectOption {
    label: string;
    value: string | number;
    /** 이 옵션만 선택 불가 처리 */
    disabled?: boolean;
    /** 옵션 앞에 표시할 아이콘. 이모지/텍스트는 문자열로, 이미지는 { src, alt }로 */
    icon?: OptionIcon;
    [key: string]: unknown;
}
