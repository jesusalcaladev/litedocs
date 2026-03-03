import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import litedocs from 'litedocs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    litedocs({
      docsDir: 'docs',
      
      homePage: './src/HomePage.tsx',
    })
  ],
});
