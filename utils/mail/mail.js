const nodemailer = require('nodemailer')
const sgTransport = require('nodemailer-sendgrid')
const hbs = require('handlebars')
const fs = require('fs')
const path = require('path')
const { capitalizeFirstLetter } = require('..')

exports.welcomeEmail = (name, email) => {
  const options = {
    apiKey: process.env.SENGRID_API_KEY
  }

  const data = {
    name: capitalizeFirstLetter(name),
    sender: process.env.SENDER_EMAIL_USERNAME,
    app_url: process.env.APP_URL,
    company_url: 'https://makeitreal.camp/'
  }

  let template = 'welcome-name'

  template = path.join(__dirname, template + '.hbs')
  const templateContent = fs.readFileSync(template)

  const compiledTemplate = hbs.compile(templateContent.toString())(data)

  const transporter = nodemailer.createTransport(sgTransport(options))

  transporter.sendMail({
    from: `"MIR Feedback Board" <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: 'Welcome on Board!',
    html: compiledTemplate
  })
}
