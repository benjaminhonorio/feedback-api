const fs = require('fs')
const path = require('path')
const mjml = require('mjml')

const file = 'welcome-name.mjml'

let fileContent = fs.readFileSync(path.join(__dirname, file))
fileContent = mjml(fileContent.toString())
const hbs = path.join(__dirname, file.replace('.mjml', '.hbs'))
fs.writeFileSync(hbs, fileContent.html)
