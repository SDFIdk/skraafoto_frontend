export async function unittest(title, testFunc) {
  try {
    await testFunc()
    console.info(`👍 Test ${title} passed`)
  }
  catch(err) {
    console.error(`❌ Test ${title} failed`)
    console.error(err)
    process.exit(1)
  }
}