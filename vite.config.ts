import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');

  // Tự động nhận diện base path:
  // 1. Nếu có biến BASE_PATH (hoặc VITE_BASE) thì dùng biến đó
  // 2. Nếu chạy trên GitHub Actions (process.env.GITHUB_REPOSITORY có dạng 'user/reponame') -> tự động thành '/reponame/'
  // 3. Trong môi trường AI Studio preview / dev server -> giữ nguyên '/'
  const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';
  const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
  const base = process.env.BASE_PATH || env.BASE_PATH || (isGitHubActions && repoName ? `/${repoName}/` : '/');

  return {
    base,
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
