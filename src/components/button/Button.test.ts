import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import Button from './Button.vue'

describe('FmButton', () => {
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
      expect(wrapper.find('.fm-button__spinner').exists()).toBe(true)
      expect(wrapper.attributes('aria-busy')).toBe('true')
    })
  })

  describe('모양', () => {
    it('기본은 filled + primary + md', () => {
      const wrapper = mount(Button)

      expect(wrapper.classes()).toEqual(
        expect.arrayContaining(['fm-button--filled', 'fm-button--primary', 'fm-button--md']),
      )
    })

    it('variant(모양)와 color(색)를 따로 조합할 수 있다', () => {
      const wrapper = mount(Button, { props: { variant: 'outlined', color: 'danger', size: 'lg' } })

      expect(wrapper.classes()).toEqual(
        expect.arrayContaining(['fm-button--outlined', 'fm-button--danger', 'fm-button--lg']),
      )
    })

    it('이름 색(primary 등)은 클래스로만 처리하고 style을 넣지 않는다', () => {
      const wrapper = mount(Button, { props: { color: 'secondary' } })

      expect(wrapper.classes()).toContain('fm-button--secondary')
      expect(wrapper.attributes('style')).toBeUndefined()
    })

    it('color에 색상값을 주면 그 색이 CSS 변수로 들어가고, 어두운 색이면 흰 글자를 고른다', () => {
      const wrapper = mount(Button, { props: { color: '#1e3a8a' } })

      expect(wrapper.classes()).toContain('fm-button--custom')
      expect(wrapper.attributes('style')).toContain('--fm-button-color: #1e3a8a')
      expect(wrapper.attributes('style')).toContain('--fm-button-on: #ffffff')
    })

    it('밝은 색상값이면 글자색을 진한 회색으로 고른다 (노란 버튼에 흰 글자 방지)', () => {
      const wrapper = mount(Button, { props: { color: '#facc15' } })

      expect(wrapper.attributes('style')).toContain('--fm-button-on: #1a1d23')
    })

    it('버튼 하나만 높이·여백을 바꾸는 변수가 그대로 전달된다', () => {
      const wrapper = mount(Button, {
        attrs: { style: '--fm-button-height: 52px; --fm-button-padding-x: 24px' },
      })

      expect(wrapper.attributes('style')).toContain('--fm-button-height: 52px')
      expect(wrapper.attributes('style')).toContain('--fm-button-padding-x: 24px')
    })

    it('icon이면 정사각형 클래스가 붙고, aria-label이 그대로 전달된다', () => {
      const wrapper = mount(Button, {
        props: { icon: true },
        attrs: { 'aria-label': '닫기' },
        slots: { default: '✕' },
      })

      expect(wrapper.classes()).toContain('fm-button--icon')
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
