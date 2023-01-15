import { test, expect } from '@playwright/test'

test('Load viewer with center, orientation, and item ID', async ({ page }) => {

  await page.goto('/viewer.html?center=722120.17972822%2C6178879.0063692&orientation=north&item=2021_84_40_2_0041_00090757', { waitUntil: 'networkidle' })
  await expect(page).toHaveScreenshot()
})


