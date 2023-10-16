import { test, expect } from '@playwright/test'

test('Search for an address from start page', async ({ page }) => {

  await page.goto('/', { waitUntil: 'networkidle' })

  await page.locator('css=dialog').getByPlaceholder('Søg adresse eller stednavn').fill('Rentemestervej 8')
  await page.getByText('Rentemestervej 8, 2400 København NV').click({ waitUntil: 'networkidle' })
  
  // Expect viewport to contain data for new address after a short while
  setTimeout(async function() {
    await expect(page.locator('css=#viewport-1')).toContainText('Billede af området omkring koordinat 722126 Ø, 6178892 N set fra nord.')
  }, 2000)
  
})
