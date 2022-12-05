'use strict'

module.exports = {
  source: {
    include: ['./src']
  },
  opts: {
    destination: "./docs",
    recurse: true,
    tutorials: "./docs/tutorials",
    readme: "./docs/introduction.md",
    package: "./package.json"
  }
}
