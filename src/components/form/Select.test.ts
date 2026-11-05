import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Select from './Select.vue'

const options = [
  { label: '사과', value: 'apple' },
  { label: '바나나', value: 'banana' },
]

describe('UiSelect', () => {
  it('variant를 안 주면 outlined (Input과 같은 기본값)', () => {
    const wrapper = mount(Select, { props: { options } })

    expect(wrapper.classes()).toContain('ui-select--outlined')
  })

  it('variant를 주면 Input과 같은 이름의 클래스가 붙는다', () => {
    const filled = mount(Select, { props: { options, variant: 'filled' } })
    const underline = mount(Select, { props: { options, variant: 'underline' } })

    expect(filled.classes()).toContain('ui-select--filled')
    expect(underline.classes()).toContain('ui-select--underline')
  })

  it('목록은 <body>로 옮겨져서 부모 카드의 overflow: hidden에 잘리지 않는다', async () => {
    const wrapper = mount(Select, { props: { options }, attachTo: document.body })

    await wrapper.find('.ui-select__trigger').trigger('click')

    // 컴포넌트 안에는 없고, body 바로 아래에 있어야 합니다.
    expect(wrapper.find('.ui-select__menu').exists()).toBe(false)
    const menu = document.body.querySelector('.ui-select__menu')
    expect(menu?.parentElement).toBe(document.body)
    expect(menu?.querySelectorAll('[role="option"]')).toHaveLength(2)

    wrapper.unmount()
  })

  it('readonly면 눌러도 목록이 열리지 않는다', async () => {
    const wrapper = mount(Select, { props: { options, readonly: true }, attachTo: document.body })

    await wrapper.find('.ui-select__trigger').trigger('click')

    expect(document.body.querySelector('.ui-select__menu')).toBeNull()
    wrapper.unmount()
  })

  it('선택된 값의 label을 보여준다', () => {
    const wrapper = mount(Select, { props: { options, modelValue: 'banana' } })

    expect(wrapper.find('.ui-select__value').text()).toBe('바나나')
  })
})
