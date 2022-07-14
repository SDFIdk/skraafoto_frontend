const translations = {
  north: 'nord',
  south: 'syd',
  east: 'øst',
  west: 'vest',
  nadir: 'top'
}

export function toDanish(word) {
  return translations[word]
} 
