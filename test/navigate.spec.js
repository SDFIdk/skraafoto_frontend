import { test, expect } from '@playwright/test'

test('Search for an address from start page', async ({ page }) => {

  await page.goto('/')

  //await page.locator('css=dialog').getByRole('button', { name: 'Forstået' }).click()
  await page.locator('css=dialog').getByPlaceholder('Søg adresse eller stednavn').fill('Rentemestervej 8')
  await page.getByText('Rentemestervej 8, 2400 København NV').click()

  // Expect viewport to contain data
  await expect(page.locator('#viewport-1')).toContainText("Billede af området omkring koordinat 574243 øst,6221024 nord set fra nord.")
})
