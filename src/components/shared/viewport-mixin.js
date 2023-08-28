import GeoTIFF from 'ol/source/GeoTIFF.js'

export function generateSource(geotiff_href) {
  return new GeoTIFF({
    convertToRGB: true,
    transition: 0,
    sources: [{ url: geotiff_href, bands: [1,2,3] }] // Ignores band 4. See https://openlayers.org/en/latest/apidoc/module-ol_source_GeoTIFF.html#~SourceInfo
  })
}
