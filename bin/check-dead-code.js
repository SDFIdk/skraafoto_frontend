#! /usr/bin/env node

/* 
 * Thanks to Tobbb at https://github.com/Tobbb/dead-exports/ 
 * for providing the first version of this script 
 */

import fs from 'node:fs'
import path from 'node:path'

let entry = './src'
let ignore = []
let allFunctions = []
const allFound = {}
process.argv.forEach(function (val, index, array) {
  if (val.includes('--s')) {
    const args = val.substr(4)
    ignore = args.split(',')
  }
  if (val.includes('--e')) {
    const args = val.substr(4)
    entry = args
  }
})

function recursivelyListDir (dir, callback, scanning) {
  for (const f of fs.readdirSync(dir)) {
    const dirPath = path.join(dir, f)
    const isDirectory = fs.statSync(dirPath).isDirectory()
    if (!scanning && isDirectory && ignore.includes(f)) {
      continue
    }
    isDirectory
      ? recursivelyListDir(dirPath, callback, scanning)
      : callback(path.join(dir, f))
  }
}

recursivelyListDir(entry, (filePath) => {
  const fileContents = fs.readFileSync(filePath, 'utf8')
  if (fileContents) {
    const functions = fileContents.match(/(?<=export function )\w+/g)
    const anonymousFunctions = fileContents.match(/(?<=export const )\w+/g)
    if (functions) {
      allFunctions = allFunctions.concat(functions)
    }
    if (anonymousFunctions) {
      allFunctions = allFunctions.concat(anonymousFunctions)
    }
  }
}, false)

recursivelyListDir(entry, (filePath) => {
  const fileContents = fs.readFileSync(filePath, 'utf8')
  if (fileContents) {
    allFunctions.forEach((item) => {
      const reg = new RegExp(item, 'g')
      const found = fileContents.match(reg)
      if (found) {
        if (allFound[item] && allFound[item].items) {
          const items = allFound[item].items.concat(found)
          allFound[item] = {
            path: filePath,
            items: items
          }
        } else {
          allFound[item] = {
            path: filePath,
            items: found
          }
        }
      }
    })
  }
}, true)

let count = 0
for (const [key, value] of Object.entries(allFound)) {
  if (value.items.length === 1) {
    console.log('\x1b[0m' + key.padEnd(30) + '\x1b[35m  \t in: \x1b[0m' + value.path)
    count += 1
  }
}
if (count > 0) {
  console.log('\x1b[32mFound: ' + count + ' unused functions')
} else {
  console.info('You have no unused functions :)')
}
