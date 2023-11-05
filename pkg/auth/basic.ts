import { Request, Response, NextFunction } from "express"

import * as log from "@utils/logger"
import * as response from "@utils/response"

export async function basicAuth(req: Request, res: Response, next: NextFunction) {
  const ctx = "basic-auth"

  if (!req.headers.authorization || req.headers.authorization.indexOf("Basic ") === -1) {
    const logData = {
      ip: (req.headers['x-forwarded-for'] || '') || req.socket.remoteAddress,
      method: req.method,
      url: req.url,
      error: 'Unauthorized'
    }
    
    log.warn(ctx, logData)
    response.resAuthenticate(res)
    return
  }

  let authPayload = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('utf8')
  let authCredentials = authPayload.split(":")

  if (authCredentials[0] === "" || authCredentials[1] === "") {
    const logData = {
      ip: (req.headers['x-forwarded-for'] || '') || req.socket.remoteAddress,
      method: req.method,
      url: req.url,
      error: 'Invalid Authorization'
    }
    
    log.warn(ctx, logData)
    response.resBadRequest(res, logData.error)
    return
  }

  req.body = JSON.stringify({
    username: authCredentials[0],
    password: authCredentials[1]
  })

  next()
}
