// 디자인 토큰(CSS 변수)을 한 번만 번들에 포함시킵니다.
import './styles/tokens.scss'

// 소비 프로젝트의 전역 컴포넌트와 이름이 겹치지 않도록 붙이는 접두사입니다.
// 패키지명이 정식으로 정해지면 그에 맞춰 한 번에 바꿀 수 있습니다.
const PREFIX = 'Lib'

// components 폴더 안의 모든 .vue 파일을 동기(eager) 방식으로 가져옵니다.
const modules = import.meta.glob('./components/**/*.vue', { eager: true })

// 파일명에 PREFIX를 붙여 등록/내보낼 컴포넌트 목록을 만듭니다.
// 예: components/form/Input.vue -> LibInput
const components: Record<string, any> = {}

Object.entries(modules).forEach(([path, mod]: [string, any]) => {
  const baseName = path.split('/').pop()?.replace('.vue', '') ?? ''
  components[`${PREFIX}${baseName}`] = mod.default
})

// import { allComponents } from 'library-test' 로 개별 컴포넌트에 접근할 때 사용
export const allComponents = components

// app.use(LibraryTest) 형태의 전역 등록용 플러그인
export default {
  install(app: any) {
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component)
    })
  },
}
