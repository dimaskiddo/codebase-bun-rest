import mailer from "nodemailer"
import validate from "validate.js"

import * as config from "@pkg/config"

import * as log from "@utils/logger"
import * as string from "@utils/string"

var client: mailer.Transporter

export async function connect() {
  if (validate.isEmpty(client)) {
    if (!validate.isEmpty(config.schema.get("mail.service"))) {
      client = mailer.createTransport({
        service: config.schema.get("mail.service"),
        auth: {
          user: config.schema.get("mail.username"),
          pass: config.schema.get("mail.password")
        }  
      })
    } else if (!validate.isEmpty(config.schema.get("mail.host"))) {
      let isSecure = false
      switch (config.schema.get("mail.port")) {
        case 465:
          isSecure = true
          break
        case 587:
          isSecure = true
          break
      }

      client = mailer.createTransport({
        host: config.schema.get("mail.host"),
        port: config.schema.get("mail.port"),
        auth: {
          user: config.schema.get("mail.username"),
          pass: config.schema.get("mail.password")
        },
        secure: isSecure,
      })
    }
  }
}

export async function send(to: string, subject: string, message: string, attachments: [] = [], msgIsHtml: boolean = false,) {
  const ctx = "mail-mailer-send"

  if (!validate.isEmpty(client)) {
    const mailOpts: mailer.SendMailOptions = {
      to: to,
      from: "\"" + config.schema.get("mail.sender") + "\" <" + config.schema.get("mail.username") + ">",
      subject: subject,
      attachments: attachments
    }

    const mailHtmlOpts: mailer.SendMailOptions = {
      ...mailOpts,
      html: message
    }

    const mailTextOpts: mailer.SendMailOptions = {
      ...mailOpts,
      text: message
    }

    try {
      switch (msgIsHtml) {
        case true:
          await client.sendMail(mailHtmlOpts)
          break        
        default:
          await client.sendMail(mailTextOpts)
          break
      }

      log.info(ctx, "Successfully Send Email to \"" + to + "\"")
    } catch(err: any) {
      log.error(ctx, "Failed to Send Email to \"" + to + "\" Caused by " + string.strToTitleCase(err.message))
    }
  }

  log.error(ctx, "Mail Client is Uninitialized")
}
