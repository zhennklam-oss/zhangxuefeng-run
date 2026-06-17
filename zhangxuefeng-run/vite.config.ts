import { defineConfig } from 'vite';

// GitHub Pages 项目站点部署在 /<repo>/ 子路径下。
// 通过环境变量 VITE_BASE 指定(CI 中设为 '/仓库名/');本地开发默认 '/'。
export default defineConfig({
  base: process.env.VITE_BASE || '/',
});
