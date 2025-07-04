// @ts-check
import { devices } from '@playwright/test'
import { configuration } from './test/e2e/test-config.js'

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
export default {
  testDir: './test/e2e',
  /* Maximum time one test can run for. */
  timeout: 30000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 10000,
    toHaveScreenshot: { maxDiffPixels: 200 },
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retries */
  retries: process.env.CI ? 1 : 2,
  /* Parallel tests */
  workers: process.env.CI ? 5 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'list' : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 30000,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASEURL ? process.env.BASEURL : 'http://localhost:5173/',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    // Set a local storage variable to hide first visit popup.
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'https://test16.dataforsyningen.dk/',
          localStorage: [
            {
              name: configuration.LOCAL_STORAGE_FIRST_TIME_VISITOR_KEY,
              value: 'false'
            }
          ]
        },
        {
          origin: 'https://test11.dataforsyningen.dk/',
          localStorage: [
            {
              name: configuration.LOCAL_STORAGE_FIRST_TIME_VISITOR_KEY,
              value: 'false'
            }
          ]
        },
        {
          origin: 'https://test23.dataforsyningen.dk/',
          localStorage: [
            {
              name: configuration.LOCAL_STORAGE_FIRST_TIME_VISITOR_KEY,
              value: 'false'
            }
          ]
        },
        {
          origin: 'http://vite:5173/',
          localStorage: [
            {
              name: configuration.LOCAL_STORAGE_FIRST_TIME_VISITOR_KEY,
              value: 'false'
            }
          ]
        },
        {
          origin: 'http://localhost:5173/',
          localStorage: [
            {
              name: configuration.LOCAL_STORAGE_FIRST_TIME_VISITOR_KEY,
              value: 'false'
            }
          ]
        }
      ]
    }
  },

  /* Configure projects for major browsers */
  
  projects: process.env.CI ? [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    }
  ] : [

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    /*
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    */

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  //webServer: {
  //  command: 'npm run dev',
  //  port: 8000,
  //}
}
