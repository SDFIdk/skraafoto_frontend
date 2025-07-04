import { test, expect } from '@playwright/test'

test('Change images when selecting another collection 1', async ({ page }) => {
  await page.goto('/?item=2023_84_40_2_0139_00061830')
  await expect(page.locator('.sf-date-selector')).toHaveValue('2023_84_40_2_0139_00061830')
})

test.slow('Change images when selecting another collection 2', async ({ page }) => {
  await page.goto('/?item=2023_84_40_2_0139_00061830', { waitUntil: 'networkidle' })
  await page.getByTitle('Vælg en årgang').selectOption('2017')
  await expect(page.locator('.sf-date-selector')).toHaveValue('2017_84_40_2_0041_00001389')
  await expect(page.url()).toContain('item=2017_84_40_2_0041_00001389')
})
