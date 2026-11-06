// Input 컴포넌트가 "약속한 대로" 동작하는지 확인하는 테스트입니다.
// 실행: npm test (파일을 고치면 자동으로 다시 돌아감) / npm run test:run (한 번만)
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Input from './Input.vue'

// describe: 관련 테스트를 한 묶음으로 모읍니다. 결과 화면에 이 이름으로 묶여서 보여요.
describe('FmInput', () => {
  // it: 테스트 하나. "무엇을 하면 → 어떻게 된다"를 문장으로 적습니다.
  it('글자를 입력하면 update:modelValue로 값을 알려준다 (v-model 동작)', async () => {
    // mount: 컴포넌트를 가짜 브라우저(jsdom)에 실제로 그립니다.
    const wrapper = mount(Input)

    // find: CSS 선택자로 요소를 찾고, setValue: 사용자가 타이핑한 것처럼 값을 넣습니다.
    await wrapper.find('input').setValue('안녕')

    // emitted: 컴포넌트가 밖으로 보낸 이벤트 기록. v-model은 update:modelValue 이벤트로 동작해요.
    // [['안녕']] 모양인 이유: 이벤트가 1번 발생했고, 그때 넘긴 값이 '안녕'이라는 뜻입니다.
    expect(wrapper.emitted('update:modelValue')).toEqual([['안녕']])
  })

  it('required인데 비워두고 포커스를 빼면 에러 메시지를 보여준다', async () => {
    // props: 부모가 넘겨주는 값. <FmInput required /> 와 같아요.
    const wrapper = mount(Input, { props: { required: true } })
    const input = wrapper.find('input')

    // 처음부터 에러가 보이면 사용자가 불편하므로, 건드리기 전에는 에러가 없어야 합니다.
    expect(wrapper.find('.fm-input__error').exists()).toBe(false)

    // trigger: 이벤트를 발생시킵니다. blur = 입력칸에서 포커스가 빠지는 순간.
    await input.trigger('blur')

    const error = wrapper.find('.fm-input__error')
    expect(error.text()).toBe('필수 입력값입니다.')
    // 화면 낭독기(스크린 리더)도 에러를 알 수 있게 aria-invalid가 켜져야 합니다.
    expect(input.attributes('aria-invalid')).toBe('true')
  })

  it('disabled면 input이 비활성화된다', () => {
    const wrapper = mount(Input, { props: { disabled: true } })

    // element: 실제 DOM 요소. disabled 속성이 진짜로 켜졌는지 확인합니다.
    expect(wrapper.find('input').element.disabled).toBe(true)
    // 스타일(회색 처리 등)을 위한 BEM modifier 클래스도 붙었는지 확인합니다.
    expect(wrapper.classes()).toContain('fm-input--disabled')
  })

  it('placeholder를 주면 input에 표시된다', () => {
    const wrapper = mount(Input, {props: {placeholder: '이름'}})

    expect(wrapper.find('input').attributes('placeholder')).toBe('이름')
  })

  it('labelPosition이 inside면 placeholder를 주더라도 input에 표시되지 않는다',() =>{
    const wrapper = mount(Input, {props: {placeholder: '이름', labelPosition: 'inside'}})

    expect(wrapper.find('input').attributes('placeholder')).toBe(undefined)
  })
})
