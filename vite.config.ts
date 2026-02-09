import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    /**
     * GitHub Pages 项目站点必须设置 base
     * 例：https://xxx.github.io/my-app/
     * 仓库名是 my-app
     */
    base: isProd ? '/identity-verification-web-dev/' : '/',

    server: {
      host: true,
      // 只在本地开发启用 https
      https: !isProd,
      port: 5173
    },

    plugins: [
      react(),
      // mkcert 仅用于本地开发
      ...(isProd ? [] : [mkcert()])
    ]
  }
})

