import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env = {...process.env, ...env};

  return defineConfig({
    plugins: [
      vue(),
      // 설치한 프로젝트에서 props 자동완성·타입 검사가 되도록 .d.ts를 생성합니다.
      // 데모(App.vue, demo/, main.ts)는 라이브러리가 아니므로 제외합니다.
      dts({
        tsconfigPath: './tsconfig.app.json',
        include: ['src/**/*.ts', 'src/**/*.vue'],
        exclude: ['src/App.vue', 'src/demo/**', 'src/main.ts'],
        // package.json이 가리킬 타입 진입점(dist/library-test.d.ts)을 만듭니다.
        // 하나로 묶는 bundleTypes는 @microsoft/api-extractor가 필요해 쓰지 않습니다.
        insertTypesEntry: true,
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      lib: {
        // 엔트리 파일 지정
        entry: resolve(import.meta.dirname, 'src/index.ts'),
        name: 'LibraryTest',
        // 빌드 결과물 파일명 규칙
        fileName: (format) => format === 'es' ? 'library-test.js' : `library-test.${format}.js`
      },
      rollupOptions: {
        // 라이브러리에 포함하지 않을 패키지 설정
        external: ['vue'],
        output: {
          // 전역 변수 설정 (CDN 환경용)
          exports: 'named',
          globals: {
            vue: 'Vue',
          }
        }
      }
    }
  })
}
