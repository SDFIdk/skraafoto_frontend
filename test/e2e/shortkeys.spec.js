import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/?item=2023_84_40_2_0139_00061830', { waitUntil: 'networkidle' })
  await page.locator('css=.btn-welcome-close').getByText('Forstået').click()
})

test('Shift view from north to east using shortkeys', async ({ page }) => {
  await expect(page.locator('css=skraafoto-viewport')).toContainText('set fra nord.')
  await page.keyboard.press('Shift+ArrowLeft')
  await expect(page.locator('css=skraafoto-viewport')).toContainText('koordinat 722119 Ø, 6178801 N set fra øst.')
})

test('Shift to earlier image using shortkeys', async ({ page }) => {
  await expect(page.locator('css=.sf-date-viewer')).toHaveValue('2023_84_40_2_0139_00061830')
  await page.keyboard.press('Shift+ArrowDown')
  await expect(page.locator('css=.sf-date-viewer')).toHaveValue('2023_84_40_2_0139_00061833')
})
