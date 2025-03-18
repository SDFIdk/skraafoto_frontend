import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'luk dialog' }).click()
})

test('Load viewer with URL params 1', async ({ page }) => {
  // Go to page and check that it renders in the correct position
  await page.goto('/?project=denmark&parcels=270554-15ax&address=Gartnervænget 3, 4160 Herlufmagle&ejendomsid=815465&x=674480.0132781528&y=6133107.9439362185&width=40&mode=4&year=2019', { waitUntil: 'networkidle' })
  await expect(page.locator('#viewport-1')).toContainText('Billede af området omkring koordinat 674480 Ø, 6133108 N set fra nord.')
})

test('Load viewer with URL params 2', async ({ page }) => {
  // Go to page and check that it renders in the correct position
  await page.goto('/?project=denmark&parcels=251855-2ø&address=Enghavevej 191, 4241 Vemmelev&ejendomsid=701314&x=642577.3159024531&y=6136801.729139142&width=40&mode=4&year=2019', { waitUntil: 'networkidle' })
  await expect(page.locator('#viewport-1')).toContainText('Billede af området omkring koordinat 642577 Ø, 6136802 N set fra nord.')
})

test('Load viewer with URL params 3', async ({ page }) => {
  // Go to page and check that it renders in the correct position
  await page.goto('/?project=denmark&parcels=442751-2k&address=Vestre Nørremarksvej 14, 5762 Vester Skerninge&ejendomsid=1082693&x=591822.4619337813&y=6104315.040791762&width=40&mode=4&year=2019', { waitUntil: 'networkidle' })
  await expect(page.locator('#viewport-1')).toContainText('Billede af området omkring koordinat 591822 Ø, 6104315 N set fra nord.')
})

test('Load viewer with URL params 4', async ({ page }) => {
  // Go to page and check that it renders in the correct position
  await page.goto('/?project=denmark&parcels=431752-12a;431752-14;431752-12r;431752-12s;431752-32;431752-31a&address=Midtervej 3A, 5762 Vester Skerninge&ejendomsid=1081717&x=594649.3404334419&y=6102974.720369647&width=40&mode=4&year=2019', { waitUntil: 'networkidle' })
  await expect(page.locator('#viewport-1')).toContainText('Billede af området omkring koordinat 594649 Ø, 6102975 N set fra nord.')
})

test('Load viewer with URL params 5', async ({ page }) => {
  // Go to page and check that it renders in the correct position
  await page.goto('/?project=denmark&parcels=1180452-156a;1180452-156p;1180452-168bf;1180452-156ah;1180452-156u;1180452-156aøg;1180452-156avt;1180452-156cd;1180452-156bap&address=Sønder Klitvej 284, Bjerregaard, 6960 Hvide Sande&ejendomsid=1858917&x=448601.1127685946&y=6190597.70005812&width=40&mode=4&year=2019', { waitUntil: 'networkidle' })
  await expect(page.locator('#viewport-1')).toContainText('Billede af området omkring koordinat 448601 Ø, 6190598 N set fra nord.')
})

test('Load viewer with bad/missing parcels', async ({ page }) => {
  // Go to page and check that it informs user of missing parcels
  await page.goto('/?parcels=1410353-201;1410353-202&address=Mælkevejen 1, Sandersvig, 6100 Haderslev&ejendomsid=1141917&year=2019&x=540964.5914037265&y=6132649.853562239&width=40&mode=4&token=e74200f9b819b0c96a656dce7e0d8850')
  await expect(page.getByText('Nogle matrikler kunne ikke indlæses')).toBeVisible()
})

test('Load viewer with many parcels', async ({ page }) => {
  // Go to page and check that it renders in the correct position
  await page.goto('/?parcels=750555-1d;751551-11c;751551-21d;751551-2aq;751551-2ar;751551-2as;751551-2o;751551-3o;751551-3p;751551-3q;751551-4v;751552-53b;751555-2d;751555-5f;751555-5q;751555-5r;751555-5s;751555-6f;751555-7l&address=Vordevej%2027,%208831%20L%C3%B8gstrup&ejendomsid=1988364&year=2019&x=519998.5342623503&y=6265346.659501427&width=40&mode=4&token=e74200f9b819b0c96a656dce7e0d8850')
  await expect(page.locator('#viewport-1')).toContainText('Billede af området omkring koordinat 519999 Ø, 6265347 N set fra nord.')
})
