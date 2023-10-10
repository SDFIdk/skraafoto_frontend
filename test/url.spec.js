import { test, expect } from '@playwright/test'

test('Load viewer with center, orientation, and item ID', async ({ page }) => {
  await page.goto('/viewer.html?center=722120.17972822%2C6178879.0063692&orientation=north&item=2021_84_40_2_0041_00090757', { waitUntil: 'networkidle' })
  await expect(page.locator('#viewport-1')).toContainText('Billede af området omkring koordinat 721760 øst,6178876 nord set fra nord.')
})

/*
test('Load viewer with center and orientation "south"', async ({ page }) => {
  await page.goto('/viewer.html?center=514279.05%2C6188146.08%2C84.4&orientation=south', { waitUntil: 'networkidle' })
  await expect(page).toHaveScreenshot()
})

test('Load viewer with center and item ID', async ({ page }) => {
  await page.goto('/viewer.html?center=514279.05%2C6188146.08%2C84.4&item=2021_83_28_3_0014_00003297', { waitUntil: 'networkidle' })
  await expect(page).toHaveScreenshot()
})

test('Load viewer with center only', async ({ page }) => {
  await page.goto('/viewer.html?center=514279.05%2C6188146.08', { waitUntil: 'networkidle' })
  await expect(page).toHaveScreenshot()
})

test('Load viewer with direction and item ID', async ({ page }) => {
  await page.goto('/viewer.html?orientation=north&item=2021_83_28_2_0014_00003307', { waitUntil: 'networkidle' })
  await expect(page).toHaveScreenshot()
})

test('Load viewer with item only', async ({ page }) => {
  await page.goto('/viewer.html?item=2021_83_28_2_0014_00003307', { waitUntil: 'networkidle' })
  await expect(page).toHaveScreenshot()
})

test('Load viewer with direction only (not map)', async ({ page }) => {
  await page.goto('/viewer.html?orientation=nadir', { waitUntil: 'networkidle' })
  await expect(page).toHaveScreenshot()
})

test('Load viewer with direction only (map)', async ({ page }) => {
  await page.goto('/viewer.html?orientation=map', { waitUntil: 'networkidle' })
  await expect(page).toHaveScreenshot()
})

test('Load viewer with center and direction map', async ({ page }) => {
  await page.goto('/viewer.html?orientation=map&center=514279.05%2C6188146.08%2C84.4', { waitUntil: 'networkidle' })
  await expect(page).toHaveScreenshot()
})
*/
