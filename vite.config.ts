import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Port 80 + the built-in *.localhost name gives the address http://akruti.localhost
  server: { port: 80, strictPort: true, host: true },
  preview: { port: 80, host: true },
});
