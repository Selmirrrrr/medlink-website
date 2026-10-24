import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 3,
  timeout: 60000,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4322', viewport: { width:1440, height:1000 }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'node tests/static-server.mjs', url: 'http://127.0.0.1:4322', reuseExistingServer: false },
});
