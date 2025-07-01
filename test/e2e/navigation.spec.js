import { test, expect } from '@playwright/test'

test('Navigate to help page', async ({ page }) => {
  await page.goto('/')
  await page.getByTitle('Information om Skråfoto').click()
  await expect(page.getByText('Information om Skråfoto')).toBeVisible()
})

test('Change to singleview', async ({ page }) => {
  await page.goto('/')
  await page.getByTitle('Singleview').click()
  await page.waitForLoadState('networkidle')
  const skraafotoViewports = await page.evaluate(() => {
    return document.querySelectorAll('skraafoto-viewport').length
  })
  await expect(skraafotoViewports).toEqual(1)
})

test('Change to twinview', async ({ page }) => {
  await page.goto('/')
  await page.getByTitle('Twinview').click()
  await page.waitForLoadState('networkidle')
  const skraafotoViewports = await page.evaluate(() => {
    return document.querySelectorAll('skraafoto-viewport').length
  })
  await expect(skraafotoViewports).toEqual(2)
})

test.slow('Change orientation to west', async ({ page }) => {
  await page.goto('/?item=2023_83_29_2_0022_00002831', { waitUntil: 'networkidle' })
  await page.getByTitle('Vis mod vest').click()
  await page.waitForLoadState('networkidle')
  await expect(page.locator('css=skraafoto-viewport')).toContainText('Billede af området omkring koordinat 534893 Ø, 6173611 N set fra øst.')
})

test.slow('Change orientation to nadir', async ({ page }) => {
  await page.goto('/?item=2023_83_29_2_0022_00002831', { waitUntil: 'networkidle' })
  await page.getByTitle('Vis fra top').click()
  await page.waitForLoadState('networkidle')
  await expect(page.locator('css=skraafoto-viewport')).toContainText('Billede af området omkring koordinat 534893 Ø, 6173611 N set fra top.')
})

test.slow('Select map view', async ({ page }) => {
  await page.goto('/?item=2023_83_29_2_0022_00002831', { waitUntil: 'networkidle' })
  await page.getByTitle('Skift til kortvisning').click()
  await page.waitForLoadState('networkidle')
  await expect(page.locator('css=skraafoto-advanced-map')).toBeVisible()
  await expect(page.locator('css=skraafoto-viewport')).toBeHidden()
})