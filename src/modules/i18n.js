const translations = {
  north: 'nord',
  south: 'syd',
  east: 'øst',
  west: 'vest',
  nadir: 'top'
}

/**
 * Translates compass directions from English (system language) to Danish
 */
export function toDanish(word) {
  return translations[word]
}
