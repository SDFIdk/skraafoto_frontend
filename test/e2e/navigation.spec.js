import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.locator('css=.btn-welcome-close').getByText('Forstået').click()
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

/*

test('Select map', async ({ page }) => {
  // Go to page and check that it renders in the correct position
  await page.goto('/?project=denmark&parcels=270554-15ax&address=Gartnervænget 3, 4160 Herlufmagle&ejendomsid=815465&x=674480.0132781528&y=6133107.9439362185&width=40&mode=4&token=e74200f9b819b0c96a656dce7e0d8850&year=2019', { waitUntil: 'networkidle' })
  await expect(page.locator('css=#viewport-1')).toContainText('Billede af området omkring koordinat 674480 Ø, 6133108 N set fra nord.')
})

*/
