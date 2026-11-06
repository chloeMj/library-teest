import { describe, it, expect, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import Modal from './Modal.vue'

// 모달은 <body>로 옮겨져서(Teleport) wrapper.find가 아니라 document에서 찾습니다.
const dialog = () => document.body.querySelector<HTMLElement>('[role="dialog"]')

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

const open = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) => {
  wrapper = mount(Modal, {
    props: { modelValue: true, title: '알림', ...props },
    slots: { default: '본문', ...slots },
    attachTo: document.body,
  })
  return wrapper
}

describe('FmModal', () => {
  it('열리면 <body>에 role="dialog"로 나타나고 제목과 연결된다', () => {
    open()

    const el = dialog()
    expect(el).not.toBeNull()
    expect(el?.getAttribute('aria-modal')).toBe('true')
    const titleId = el?.getAttribute('aria-labelledby')
    expect(document.getElementById(titleId!)?.textContent).toContain('알림')
  })

  it('modelValue가 false면 아무것도 그리지 않는다', () => {
    open({ modelValue: false })

    expect(dialog()).toBeNull()
  })

  it('Esc를 누르면 닫기(update:modelValue false)를 보낸다', async () => {
    const w = open()

    dialog()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()

    expect(w.emitted('update:modelValue')).toEqual([[false]])
  })

  it('closeOnEsc가 false면 Esc로 닫히지 않는다', async () => {
    const w = open({ closeOnEsc: false })

    dialog()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()

    expect(w.emitted('update:modelValue')).toBeUndefined()
  })

  it('바깥(배경)을 누르면 닫히고, closeOnBackdrop이 false면 안 닫힌다', async () => {
    const w = open()
    document.body.querySelector<HTMLElement>('.fm-modal__backdrop')!.click()
    expect(w.emitted('update:modelValue')).toEqual([[false]])
    w.unmount()

    const w2 = open({ closeOnBackdrop: false })
    document.body.querySelector<HTMLElement>('.fm-modal__backdrop')!.click()
    expect(w2.emitted('update:modelValue')).toBeUndefined()
  })

  it('열린 동안 뒤 화면 스크롤을 막고, 닫히면 풀어 준다', async () => {
    const w = open()
    expect(document.body.style.overflow).toBe('hidden')

    await w.setProps({ modelValue: false })
    expect(document.body.style.overflow).toBe('')
  })

  it('footer 슬롯에 close 함수를 넘겨 준다', async () => {
    const w = mount(Modal, {
      props: { modelValue: true },
      slots: { footer: `<template #footer="{ close }"><button class="ok" @click="close">확인</button></template>` },
      attachTo: document.body,
    })
    wrapper = w

    document.body.querySelector<HTMLElement>('.ok')!.click()

    expect(w.emitted('update:modelValue')).toEqual([[false]])
  })
})
