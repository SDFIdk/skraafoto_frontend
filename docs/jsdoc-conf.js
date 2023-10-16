export default {
  source: {
    include: ['./src']
  },
  opts: {
    destination: "./docs/api",
    recurse: true,
    tutorials: "./docs/tutorials",
    readme: "./docs/introduction.md"
  }
}
