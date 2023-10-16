function getYearFromCollection(collection) {
  const yearRegex = /[0-9]{4}/g
  return collection.match(yearRegex)[0]
}

export {
  getYearFromCollection
}