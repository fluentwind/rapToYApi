const path = require('path')
const fs = require('fs')
const RapParser = require('./parser/rap')
const Converter = require('./converter/rapToYapi')
const args = process.argv.slice(2)
if (args.length === 0) {
  console.log('need filePath as the first arg')
  process.exit(1)
}
const originalFile = path.resolve(args[0])

const rapData = fs.readFileSync(originalFile, { encoding: 'UTF-8' })
const data = new RapParser(rapData)
const yapiData = new Converter(data)

const yapiJson = JSON.stringify(yapiData)

fs.writeFileSync(path.resolve(__dirname, '../yapi.json'), yapiJson)

console.log('YApi中不支持GET请求带json，转换过程中会将GET转换为POST请求，并添加备注：[原来是GET]')
console.log('generated file: ' + path.resolve(__dirname, '../yapi.json'))
process.exit(0)
