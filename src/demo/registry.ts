// 데모 카탈로그 목록.
// 컴포넌트를 추가하면 demo/ 에 섹션 파일을 만들고 여기에 한 줄만 더하세요.
// 사이드바 메뉴와 화면 전환이 이 목록으로 자동 구성됩니다.
import type { Component } from 'vue'
import InputSection from './InputSection.vue'
import SelectSection from './SelectSection.vue'
import RadioSection from './RadioSection.vue'
import CheckboxSection from './CheckboxSection.vue'
import ButtonSection from './ButtonSection.vue'

export interface DemoEntry {
  /** 주소(#id)와 섹션 id로 함께 씁니다 */
  id: string
  label: string
  /** 사이드바에서 묶을 분류 */
  group: string
  component: Component
}

export const demos: DemoEntry[] = [
  { id: 'button', label: 'Button', group: 'Action', component: ButtonSection },
  { id: 'input', label: 'Input', group: 'Form', component: InputSection },
  { id: 'select', label: 'Select', group: 'Form', component: SelectSection },
  { id: 'radio', label: 'Radio', group: 'Form', component: RadioSection },
  { id: 'checkbox', label: 'Checkbox', group: 'Form', component: CheckboxSection },
]
