/*
import MyButton from './components/MyButton.vue';

// 개별 컴포넌트 내보내기
export { MyButton };

// 플러그인 형태로 한 번에 등록할 수 있도록 기본 내보내기 제공 (선택)
export default {
  install: (app: any) => {
    app.component('MyButton', MyButton);
  }
};
*/


// 1. components 폴더 안의 모든 .vue 파일을 동기(eager) 방식으로 가져옵니다.
const components = import.meta.glob('./components/**/*.vue', { eager: true })

// 2. 개별 export를 위한 객체 생성
const exportedComponents: Record<string, any> = {}

// 3. 파일 목록을 돌면서 컴포넌트 이름을 추출하고 객체에 담습니다.
Object.entries(components).forEach((component: any) => {
  const [path, module] = component
  // 경로에서 파일 이름만 추출 (예: './components/MyButton.vue' -> 'MyButton')
  const componentName = String(path?.split('/')?.pop().replace('.vue', '') ?? '')
  
  // 컴포넌트 원본 소스는 module.default에 들어있습니다.
  exportedComponents[componentName] = module.default
})

// 개별 컴포넌트 내보내기 (구조 분해 할당으로 자동 export 효과)
// import { MyButton, MyInput } from 'my-vue-library'
export const { ...allComponents } = exportedComponents
console.log('exportedComponents:', exportedComponents)
// 통째로 등록하는 플러그인 기능 자동화
export default {
  install: (app: any) => {
    Object.entries(exportedComponents).forEach(([name, component]) => {
      app.component(name, component)
    })
  }
}