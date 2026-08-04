import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env = {...process.env, ...env};

  return defineConfig({
    plugins: [
      vue({
        template: { transformAssetUrls }
      }),
      quasar({
        sassVariables: fileURLToPath(new URL('./src/css/quasar.variables.scss', import.meta.url)),
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
        external: ['vue', 'quasar'], 
        output: {
          // 전역 변수 설정 (CDN 환경용)
          exports: 'named', 
          globals: {
            vue: 'Vue',
            quasar: 'Quasar' // 전역 변수 매핑 추가
          }
        }
      }
    }
  })
}