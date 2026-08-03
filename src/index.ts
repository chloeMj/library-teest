import MyButton from './components/MyButton.vue';

// 개별 컴포넌트 내보내기
export { MyButton };

// 플러그인 형태로 한 번에 등록할 수 있도록 기본 내보내기 제공 (선택)
export default {
  install: (app: any) => {
    app.component('MyButton', MyButton);
  }
};