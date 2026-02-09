
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // 允许局域网内其他设备访问
    host: true,
    // 开启 HTTPS
    https: true,
    // 默认端口
    port: 5173
  },
  plugins: [
    react(),
    // 自动生成并配置本地 HTTPS 证书
    mkcert()
  ]
});
