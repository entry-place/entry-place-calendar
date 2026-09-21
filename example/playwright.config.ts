import { defineConfig } from '@playwright/test'

const MOCK = 'http://127.0.0.1:4010'
const APP = 'http://127.0.0.1:4011'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: APP, trace: 'on-first-retry' },
  webServer: [
    {
      command: 'node mock-portal.mjs',
      url: `${MOCK}/api/v1/calendar/riverbend`,
      // Never reuse: a stale mock serving old fixtures is the one failure
      // mode that would quietly invalidate every assertion here.
      reuseExistingServer: false,
      stdout: 'ignore',
    },
    {
      command: 'npm run start',
      url: `${APP}/calendar`,
      reuseExistingServer: !process.env.CI,
      stdout: 'ignore',
    },
  ],
})
