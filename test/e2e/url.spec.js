import { test, expect } from '@playwright/test'

test('Load viewer with center, orientation, and item ID', async ({ page }) => {
  // Go to page and check that it renders in the correct position
  await page.goto('/?center=722120.17972822%2C6178879.0063692&orientation=north&item=2021_84_40_2_0041_00090757', { waitUntil: 'networkidle' })
  await expect(page.locator('#viewport-1')).toContainText('Billede af området omkring koordinat 722120 Ø, 6178879 N set fra nord.')
})

test('Load viewer with center in WGS84 x/y format', async ({ page }) => {
  // Go to page and check that it renders in the correct position
  await page.goto('/?x=10.252991&y=55.541065', { waitUntil: 'networkidle' })
  await expect(page.locator('css=#viewport-1')).toContainText('Billede af området omkring koordinat 579068 Ø, 6155716 N set fra nord.')
})

test('Load viewer with "center" url parameter (EPSG:25832)', async ({ page }) => {
  // Go to page and check that it renders in the correct position
  await page.goto('/?center=726302,6096616', { waitUntil: 'networkidle' })
  await expect(page.locator('css=#viewport-1')).toContainText('Billede af området omkring koordinat 726302 Ø, 6096616 N set fra nord.')
})

test('Load viewer with center in EPSG:25832 x/y format', async ({ page }) => {
  // Go to page and check that it renders in the correct position
  await page.goto('/?x=726302&y=6096616', { waitUntil: 'networkidle' })
  await expect(page.locator('css=#viewport-1')).toContainText('Billede af området omkring koordinat 726302 Ø, 6096616 N set fra nord.')
})

test('Load viewer with item only', async ({ page }) => {
  // Go to page and check that it renders in the correct position
  await page.goto('/?item=2023_83_29_5_0025_00002157', { waitUntil: 'networkidle' })
  await expect(page.locator('css=#viewport-1')).toContainText('Billede af området omkring koordinat 535071 Ø, 6173520 N set fra vest.')
})
