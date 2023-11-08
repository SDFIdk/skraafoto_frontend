import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('skraafoto-virgin', false)
  })
  await page.goto('/?item=2023_84_40_2_0139_00061830', { waitUntil: 'networkidle' })
})

test('Change position when clicking in the viewport', async ({ page }) => {
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
  await expect(page.locator('css=skraafoto-viewport')).toContainText('koordinat 722102 Ø, 6178844 N set fra nord.')
  await expect(page.getByTitle('Billede af området omkring koordinat 722102 Ø, 6178844 N set fra øst.')).toBeDefined()
})

/*
  - center viewport when URL center was given
  - center viewport when no URL center is given
  - center viewport when clicking the main viewport
  - center viewport when using crosshair tool
  - center viewport when selecting another direction
  - center viewport when selecting another collection


test('center viewport when no URL center was given', async ({ page }) => {

})

*/
