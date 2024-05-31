import { test } from 'node:test'
import assert from 'node:assert'

test('Check that services.datafordeler.dk is working', async () => {
  const response = await fetch('https://services.datafordeler.dk/DHMTerraen/DHMKoter/1.0.0/GEOREST/HentKoter', {
    method: 'GET'
  })
  assert.equal(response.statusText, 'Forbidden')
})
