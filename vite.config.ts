import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      // 엔트리 파일 지정
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyVueLibrary',
      // 빌드 결과물 파일명 규칙
      fileName: (format) => `my-vue-library.${format}.js`
    },
    rollupOptions: {
      // 라이브러리에 포함하지 않을 패키지 설정
      external: ['vue'],
      output: {
        // 전역 변수 설정 (CDN 환경용)
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
