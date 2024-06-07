import { test, expect } from '@playwright/test'
import { configuration } from './test-config.js'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate((conf) => {
    localStorage.setItem(conf.LOCAL_STORAGE_FIRST_TIME_VISITOR_KEY, false)
  }, configuration)
  await page.goto('/')
})

test('Navigate to help page', async ({ page }) => {
  await page.getByTitle('Information om Skråfoto').click()
  await expect(page.getByText('Information om Skråfoto')).toBeVisible()
})

test('Change to singleview', async ({ page }) => {
  await page.getByTitle('Vis ét stort billede').click()
  await page.waitForLoadState('networkidle')
  const skraafotoViewports = await page.evaluate(() => {
    return document.querySelectorAll('skraafoto-viewport').length
  })
  await expect(skraafotoViewports).toEqual(1)
})

test('Change to twinview', async ({ page }) => {
  await page.getByTitle('Vis 2 store billeder').click()
  await page.waitForLoadState('networkidle')
  const skraafotoViewports = await page.evaluate(() => {
    return document.querySelectorAll('skraafoto-viewport').length
  })
  await expect(skraafotoViewports).toEqual(2)
})

test('Change orientation to west', async ({ page }) => {
  await page.goto('/?item=2023_83_29_2_0022_00002831', { waitUntil: 'networkidle' })
  await page.getByTitle('Vis mod vest').click()
  await page.waitForLoadState('networkidle')
  await expect(page.locator('css=skraafoto-viewport')).toContainText('Billede af området omkring koordinat 534893 Ø, 6173611 N set fra vest.')
})

test('Change orientation to nadir', async ({ page }) => {
  await page.goto('/?item=2023_83_29_2_0022_00002831', { waitUntil: 'networkidle' })
  await page.getByTitle('Vis fra top').click()
  await page.waitForLoadState('networkidle')
  await expect(page.locator('css=skraafoto-viewport')).toContainText('Billede af området omkring koordinat 534893 Ø, 6173611 N set fra top.')
})

test('Select map view', async ({ page }) => {
  await page.goto('/?item=2023_83_29_2_0022_00002831', { waitUntil: 'networkidle' })
  await page.getByTitle('Skift til kortvisning').click()
  await page.waitForLoadState('networkidle')
  await expect(page.locator('css=skraafoto-advanced-map')).toBeVisible()
  await expect(page.locator('css=skraafoto-viewport')).toBeHidden()
})
