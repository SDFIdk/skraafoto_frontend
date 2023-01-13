import { test, expect } from '@playwright/test'

test('Search for an address from start page', async ({ page }) => {

  await page.goto('/')

  await page.getByPlaceholder('Søg adresse eller stednavn').fill('Rentemestervej 8')
  await page.getByText('Rentemestervej 8, 2400 København NV').click()

  // Expect main viewport to contain data
  await expect(page.locator('#viewport-main')).toContainText("Billede af området omkring koordinat 721760 øst,6178876 nord set fra nord.", { timeout: 10000 })
  await expect(page.locator('#viewport-north')).toContainText("Billede af området omkring koordinat 721760 øst,6178876 nord set fra nord.", { timeout: 10000 })
  await expect(page.locator('#viewport-nadir')).toContainText("Billede af området omkring koordinat 722482 øst,6178711 nord set fra top.", { timeout: 10000 })
  await expect(page.locator('#viewport-east')).toContainText("Billede af området omkring koordinat 721879 øst,6178807 nord set fra øst.", { timeout: 10000 })
  await expect(page.locator('#viewport-south')).toContainText("Billede af området omkring koordinat 722476 øst,6178944 nord set fra syd.", { timeout: 10000 })
  await expect(page.locator('#viewport-west')).toContainText("Billede af området omkring koordinat 722392 øst,6178959 nord set fra vest.", { timeout: 10000 })
})
