import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/?item=2023_84_40_2_0139_00061830', { waitUntil: 'networkidle' })
})

test('Shift view from north to east using shortkeys', async ({ page }) => {
  await page.keyboard.press('Shift+ArrowLeft')
  await expect(page.locator('skraafoto-viewport')).toContainText('koordinat 722119 Ø, 6178801 N set fra vest.')
})

test('Shift to earlier image using shortkeys', async ({ page }) => {
  await page.keyboard.press('Shift+ArrowDown')
  await expect(page.locator('.sf-date-selector')).toHaveValue('2023_84_40_2_0139_00061833')
})