import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import Button from './Button.vue'

describe('UiButton', () => {
  describe('기본 동작', () => {
    it('누르면 click 이벤트를 보낸다', async () => {
      const wrapper = mount(Button, { slots: { default: '저장' } })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toHaveLength(1)
      expect(wrapper.text()).toBe('저장')
    })

    it('type을 안 주면 button 타입이라 form 안에서 눌러도 제출되지 않는다', () => {
      const wrapper = mount(Button)

      expect(wrapper.attributes('type')).toBe('button')
    })

    it('disabled면 눌러도 click 이벤트를 보내지 않는다', async () => {
      const wrapper = mount(Button, { props: { disabled: true } })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeUndefined()
      expect((wrapper.element as HTMLButtonElement).disabled).toBe(true)
    })

    it('loading이면 스피너를 보여주고 다시 누를 수 없다', async () => {
      const wrapper = mount(Button, { props: { loading: true } })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeUndefined()
      expect(wrapper.find('.ui-button__spinner').exists()).toBe(true)
      expect(wrapper.attributes('aria-busy')).toBe('true')
    })
  })

  describe('모양', () => {
    it('기본은 filled + primary + md', () => {
      const wrapper = mount(Button)

      expect(wrapper.classes()).toEqual(
        expect.arrayContaining(['ui-button--filled', 'ui-button--primary', 'ui-button--md']),
      )
    })

    it('variant(모양)와 color(색)를 따로 조합할 수 있다', () => {
      const wrapper = mount(Button, { props: { variant: 'outlined', color: 'danger', size: 'lg' } })

      expect(wrapper.classes()).toEqual(
        expect.arrayContaining(['ui-button--outlined', 'ui-button--danger', 'ui-button--lg']),
      )
    })

    it('버튼 하나만 높이·여백을 바꾸는 변수가 그대로 전달된다', () => {
      const wrapper = mount(Button, {
        attrs: { style: '--ui-button-height: 52px; --ui-button-padding-x: 24px' },
      })

      expect(wrapper.attributes('style')).toContain('--ui-button-height: 52px')
      expect(wrapper.attributes('style')).toContain('--ui-button-padding-x: 24px')
    })

    it('icon이면 정사각형 클래스가 붙고, aria-label이 그대로 전달된다', () => {
      const wrapper = mount(Button, {
        props: { icon: true },
        attrs: { 'aria-label': '닫기' },
        slots: { default: '✕' },
      })

      expect(wrapper.classes()).toContain('ui-button--icon')
      expect(wrapper.attributes('aria-label')).toBe('닫기')
    })
  })

  describe('링크', () => {
    it('href를 주면 <a>로 그려지고 type 속성은 없다', () => {
      const wrapper = mount(Button, { props: { href: '/guide' } })

      expect(wrapper.element.tagName).toBe('A')
      expect(wrapper.attributes('href')).toBe('/guide')
      expect(wrapper.attributes('type')).toBeUndefined()
    })

    it('새 탭으로 열면 보안을 위해 rel="noopener noreferrer"가 붙는다', () => {
      const wrapper = mount(Button, { props: { href: 'https://example.com', target: '_blank' } })

      expect(wrapper.attributes('rel')).toBe('noopener noreferrer')
    })

    it('disabled 링크는 href가 빠져서 이동하지 않는다', async () => {
      const wrapper = mount(Button, { props: { href: '/guide', disabled: true } })

      await wrapper.trigger('click')

      expect(wrapper.attributes('href')).toBeUndefined()
      expect(wrapper.attributes('aria-disabled')).toBe('true')
      expect(wrapper.emitted('click')).toBeUndefined()
    })

    it('to를 주면 RouterLink로 그려진다', () => {
      // 테스트에는 vue-router가 없으므로, 가짜 RouterLink(RouterLinkStub)를 등록합니다.
      const wrapper = mount(Button, {
        props: { to: '/users' },
        global: { components: { RouterLink: RouterLinkStub } },
      })

      expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/users')
    })
  })
})
