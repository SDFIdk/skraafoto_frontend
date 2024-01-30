import { test, expect } from '@playwright/test'

test('Change position when clicking in the viewport', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('skraafoto-splash', false)
  })
  await page.goto('/?item=2023_84_40_2_0139_00061830', { waitUntil: 'networkidle' })

  await expect(page.locator('css=skraafoto-viewport')).toContainText('koordinat 722119 Ø, 6178801 N set fra nord.')
  await expect(page.getByTitle('Billede af området omkring koordinat 722119 Ø, 6178801 N set fra øst.')).toBeDefined()

  const centerTool = await page.getByTitle('Aktivér sigtekorn')
  if (centerTool) {
    await centerTool.click()
    await page.mouse.click(200,200)
  } else {
    await page.mouse.click(200,200)
  }
  await page.waitForLoadState('networkidle')
  await expect(page.locator('css=skraafoto-viewport')).toContainText('koordinat 722099 Ø, 6178842 N set fra nord.')
  await expect(page.getByTitle('Billede af området omkring koordinat 722099 Ø, 6178842 N set fra øst.')).toBeDefined()
})
