import { test, expect } from '@playwright/test'
import { configuration } from './test-config.js'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate((conf) => {
    localStorage.setItem(conf.LOCAL_STORAGE_FIRST_TIME_VISITOR_KEY, false)
  }, configuration)
})

test('Change images when selecting another collection', async ({ page }) => {
  await page.goto('/?item=2023_84_40_2_0139_00061830', { waitUntil: 'networkidle' })

  await expect(page.locator('css=.sf-date-selector')).toHaveValue('2023_84_40_2_0139_00061830')
  await page.getByTitle('Vælg en årgang').selectOption('2017')
  await expect(page.locator('css=.sf-date-selector')).toHaveValue('2017_84_40_2_0041_00001389')
  await expect(page.url()).toContain('item=2017_84_40_2_0041_00001389')
})
