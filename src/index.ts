// 디자인 토큰(CSS 변수)을 한 번만 번들에 포함시킵니다.
import './styles/tokens.scss'

import type { App, Component, Plugin } from 'vue'

import Input from './components/form/Input.vue'
import Select from './components/form/Select.vue'
import Radio from './components/form/Radio.vue'
import Checkbox from './components/form/Checkbox.vue'

// 소비 프로젝트의 전역 컴포넌트와 이름이 겹치지 않도록 Ui 접두사를 붙입니다.
// (glob으로 자동 수집하던 방식에서 명시적 나열로 바꿨습니다 — 자동 수집은 타입을
//  any로 만들어 설치한 쪽에서 props 자동완성·검사가 되지 않습니다)
// 전역 등록용 목록. 개별 타입은 아래 named export와 GlobalComponents 선언이 제공합니다.
export const allComponents: Record<string, Component> = {
  UiInput: Input,
  UiSelect: Select,
  UiRadio: Radio,
  UiCheckbox: Checkbox,
}

// 개별 import 용: import { UiInput } from 'library-test'
export { Input as UiInput, Select as UiSelect, Radio as UiRadio, Checkbox as UiCheckbox }

// 공개 타입
export type { LabelPosition, ErrorPosition, SelectOption, OptionIcon } from './types/form'
export type { FieldValidator, FieldValue } from './composables/useFieldValidation'

// app.use(LibraryTest) 형태의 전역 등록용 플러그인
const plugin: Plugin = {
  install(app: App) {
    Object.entries(allComponents).forEach(([name, component]) => {
      app.component(name, component)
    })
  },
}

export default plugin

// 전역 등록된 컴포넌트를 템플릿에서 쓸 때 타입이 잡히도록 선언합니다.
// 이게 있어야 설치한 프로젝트에서도 <UiInput>의 props가 자동완성됩니다.
declare module 'vue' {
  export interface GlobalComponents {
    UiInput: typeof Input
    UiSelect: typeof Select
    UiRadio: typeof Radio
    UiCheckbox: typeof Checkbox
  }
}
