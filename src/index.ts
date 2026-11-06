// 디자인 토큰(CSS 변수)을 한 번만 번들에 포함시킵니다.
import './styles/tokens.scss'

import type { App, Component, Plugin } from 'vue'

import Input from './components/form/Input.vue'
import Select from './components/form/Select.vue'
import Radio from './components/form/Radio.vue'
import Checkbox from './components/form/Checkbox.vue'
import Button from './components/button/Button.vue'
import Modal from './components/modal/Modal.vue'

// 전역 등록용 목록. 설치한 프로젝트의 컴포넌트와 겹치지 않도록 Fm 접두사를 붙입니다.
// 컴포넌트를 추가하면 위 import와 이 목록에 한 줄씩 더하면 됩니다.
export const allComponents: Record<string, Component> = {
  FmInput: Input,
  FmSelect: Select,
  FmRadio: Radio,
  FmCheckbox: Checkbox,
  FmButton: Button,
  FmModal: Modal,
}

// 개별 import 용: import { FmInput } from 'forma-ui-framework'
export { Input as FmInput, Select as FmSelect, Radio as FmRadio, Checkbox as FmCheckbox, Button as FmButton, Modal as FmModal }

// 공개 타입
export type { LabelPosition, ErrorPosition, FieldVariant, SelectOption, OptionIcon } from './types/form'
export type { FieldValidator, FieldValue } from './composables/useFieldValidation'

// app.use(FormaUI) 형태의 전역 등록용 플러그인
const plugin: Plugin = {
  install(app: App) {
    Object.entries(allComponents).forEach(([name, component]) => {
      app.component(name, component)
    })
  },
}

export default plugin

// 전역 등록된 컴포넌트를 템플릿에서 쓸 때 타입이 잡히도록 선언합니다.
// 이게 있어야 설치한 프로젝트에서도 <FmInput>의 props가 자동완성됩니다.
declare module 'vue' {
  export interface GlobalComponents {
    FmInput: typeof Input
    FmSelect: typeof Select
    FmRadio: typeof Radio
    FmCheckbox: typeof Checkbox
    FmButton: typeof Button
    FmModal: typeof Modal
  }
}
