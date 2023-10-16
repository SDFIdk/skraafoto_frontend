import { test, expect } from '@playwright/test'
import { checkMapParcels } from './shared.js'

test('Load viewer with URL params 1', async ({ page }) => {
  // Go to page and check that it renders in the correct position
  await page.goto('/?project=denmark&parcels=270554-15ax&address=Gartnervænget 3, 4160 Herlufmagle&ejendomsid=815465&x=674480.0132781528&y=6133107.9439362185&width=40&mode=4&token=e74200f9b819b0c96a656dce7e0d8850&year=2019', { waitUntil: 'networkidle' })
  await expect(page.locator('css=#viewport-1')).toContainText('Billede af området omkring koordinat 674480 Ø, 6133108 N set fra nord.')
  // Check that a parcel layer has been rendered
  /*
  const hasParcels = await checkMapParcels(page, '#viewport-1')
  await expect(hasParcels).toBeTruthy()
  */
})

test('Load viewer with URL params 2', async ({ page }) => {
  // Go to page and check that it renders in the correct position
  await page.goto('/?project=denmark&parcels=251855-2ø&address=Enghavevej 191, 4241 Vemmelev&ejendomsid=701314&x=642577.3159024531&y=6136801.729139142&width=40&mode=4&token=e74200f9b819b0c96a656dce7e0d8850&year=2019', { waitUntil: 'networkidle' })
  await expect(page.locator('css=#viewport-1')).toContainText('Billede af området omkring koordinat 642577 Ø, 6136802 N set fra nord.')
  // Check that a parcel layer has been rendered
  /*
  const hasParcels = await checkMapParcels(page, '#viewport-1')
  await expect(hasParcels).toBeTruthy()
  */
})

test('Load viewer with URL params 3', async ({ page }) => {
  // Go to page and check that it renders in the correct position
  await page.goto('/?project=denmark&parcels=442751-2k&address=Vestre Nørremarksvej 14, 5762 Vester Skerninge&ejendomsid=1082693&x=591822.4619337813&y=6104315.040791762&width=40&mode=4&token=e74200f9b819b0c96a656dce7e0d8850&year=2019', { waitUntil: 'networkidle' })
  await expect(page.locator('css=#viewport-1')).toContainText('Billede af området omkring koordinat 591822 Ø, 6104315 N set fra nord.')
  // Check that a parcel layer has been rendered
  /*
  const hasParcels = await checkMapParcels(page, '#viewport-1')
  await expect(hasParcels).toBeTruthy()
  */
})

test('Load viewer with URL params 4', async ({ page }) => {
  // Go to page and check that it renders in the correct position
  await page.goto('/?project=denmark&parcels=431752-12a;431752-14;431752-12r;431752-12s;431752-32;431752-31a&address=Midtervej 3A, 5762 Vester Skerninge&ejendomsid=1081717&x=594649.3404334419&y=6102974.720369647&width=40&mode=4&token=e74200f9b819b0c96a656dce7e0d8850&year=2019', { waitUntil: 'networkidle' })
  await expect(page.locator('css=#viewport-1')).toContainText('Billede af området omkring koordinat 594649 Ø, 6102975 N set fra nord.')
  // Check that a parcel layer has been rendered
  /*
  const hasParcels = await checkMapParcels(page, '#viewport-1')
  await expect(hasParcels).toBeTruthy()
  */
})

test('Load viewer with URL params 5', async ({ page }) => {
  // Go to page and check that it renders in the correct position
  await page.goto('/?project=denmark&parcels=1180452-156a;1180452-156p;1180452-168bf;1180452-156ah;1180452-156u;1180452-156aøg;1180452-156avt;1180452-156cd;1180452-156bap&address=Sønder Klitvej 284, Bjerregaard, 6960 Hvide Sande&ejendomsid=1858917&x=448601.1127685946&y=6190597.70005812&width=40&mode=4&token=e74200f9b819b0c96a656dce7e0d8850&year=2019', { waitUntil: 'networkidle' })
  await expect(page.locator('css=#viewport-1')).toContainText('Billede af området omkring koordinat 448601 Ø, 6190598 N set fra nord.')
  // Check that a parcel layer has been rendered
  /*
  const hasParcels = await checkMapParcels(page, '#viewport-1')
  await expect(hasParcels).toBeTruthy()
  */
})
