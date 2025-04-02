import { test, expect } from '@playwright/test'
import { configuration } from './test-config.js'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate((conf) => {
    localStorage.setItem(conf.LOCAL_STORAGE_FIRST_TIME_VISITOR_KEY, false)
  }, configuration)
})

test('Change position when clicking in the viewport 1', async ({ page }) => {
  await page.goto('/?item=2023_84_40_2_0139_00061830', { waitUntil: 'networkidle' })
  await expect(page.locator('skraafoto-viewport')).toContainText('koordinat 722119 Ø, 6178801 N set fra syd.')
  await expect(page.getByTitle('Billede af området omkring koordinat 722119 Ø, 6178801 N set fra vest.')).toBeDefined()
})

test('Change position when clicking in the viewport 2', async ({ page }) => {
  await page.goto('/?item=2023_84_40_2_0139_00061830', { waitUntil: 'networkidle' })
  const centerTool = await page.locator('skraafoto-pin-tool button')
  if (centerTool) {
    await centerTool.click()
    await page.mouse.click(200,200)
  } else {
    await page.mouse.click(200,200)
  }
  await page.waitForLoadState('networkidle')
  await expect(page.locator('css=skraafoto-viewport')).toContainText('koordinat 722102 Ø, 6178841 N set fra syd.')
  await expect(page.getByTitle('Billede af området omkring koordinat 722102 Ø, 6178841 N set fra vest.')).toBeDefined()
})