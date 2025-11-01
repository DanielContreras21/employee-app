import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/tests',
  timeout: 30000,
  use: {
    headless: false, // Cambia a true si quieres ejecutar sin abrir navegador
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
    ignoreHTTPSErrors: true,
    baseURL: 'http://localhost:4200', // base de tu app Angular
  },
});
