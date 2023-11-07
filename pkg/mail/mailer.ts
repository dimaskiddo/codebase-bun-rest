import mailer from "nodemailer"
import validate from "validate.js"

import * as config from "@pkg/config"

import * as log from "@utils/logger"
import * as string from "@utils/string"

var client: mailer.Transporter

export async function connect() {
  if (validate.isEmpty(config.schema.get("mail.service"))) {
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
      service: config.schema.get("mail.service"),
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

export async function send(to: string, subject: string, message: string, msgIsHtml: boolean = false, attachments: [] = []) {
  const ctx = "mail-mailer-send"

  if (validate.isEmpty(config.schema.get("mail.service"))) {
    try {
      switch (msgIsHtml) {
        case true:
          await client.sendMail({
            from: "\""+ config.schema.get("mail.sender") +"\" " + config.schema.get("mail.username"),
            to: to,
            subject: subject,
            html: message,
            attachments: attachments
          })
          break        
        default:
          await client.sendMail({
            from: "\""+ config.schema.get("mail.sender") +"\" " + config.schema.get("mail.username"),
            to: to,
            subject: subject,
            text: message,
            attachments: attachments
          })
          break
      }

      log.info(ctx, "Successfully to Send Email for \"" + to + "\"")
    } catch(err: any) {
      log.error(ctx, "Failed to Send Email for \"" + to + "\". Caused by " + string.strToTitleCase(err.message))
    }
  }

  log.error(ctx, "Mail Client is Uninitialized")
}
