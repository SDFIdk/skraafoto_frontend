const translations = {
  north: 'nord',
  south: 'syd',
  east: 'øst',
  west: 'vest'
}

export function toDanish(word) {
  return translations[word]
} 
