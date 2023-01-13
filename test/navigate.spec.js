import { test, expect } from '@playwright/test'

// Run tests in this file with portrait-like viewport.
test.use({ headless: false, viewport: { width: 600, height: 900 } });

test('Search for an address from start page', async ({ page }) => {

  await page.goto('/')

  await page.getByPlaceholder('Søg adresse eller stednavn').fill('Rentemestervej 8')
  await page.getByText('Rentemestervej 8, 2400 København NV').click()

  // Expect main viewport to contain data
  await expect(page.locator('#viewport-main')).toContainText("Billede af området omkring koordinat 721760 øst,6178876 nord set fra nord.", { timeout: 10000 })
})
