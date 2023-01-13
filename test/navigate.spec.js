import { test, expect } from '@playwright/test'


test('Search for an address from start page', async ({ page }) => {

  await page.goto('/')
  await page.getByPlaceholder('Søg adresse eller stednavn').fill('Rentemestervej 8')
  await page.getByPlaceholder('Søg adresse eller stednavn').press('Enter')

  // Expect main viewport to contain data
  await expect(page.locator('#viewport-main')).toContainText("Billede af området omkring koordinat 721760 øst,6178876 nord set fra nord.", { timeout: 20000 })
})
