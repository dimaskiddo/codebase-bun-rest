import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

import * as config from "@pkg/config"

import * as log from "@utils/logger"
import * as response from "@utils/response"
import * as crypt from "@utils/crypt"

const opts: jwt.SignOptions = {
  algorithm: "RS256",
  issuer: config.schema.get("jwt.issuer"),
  audience: config.schema.get("jwt.audience")
}

const jwtTokenOptions: jwt.SignOptions = {
  ...opts,
  expiresIn: config.schema.get("jwt.expired")
}

const jwtRefreshOptions: jwt.SignOptions = {
  ...opts,
  expiresIn: config.schema.get("jwt.refresh")
}

export async function jwtAuth(req: Request, res: Response, next: NextFunction) {
  const ctx = "jwt-auth"

  if (!req.headers.authorization || req.headers.authorization.indexOf("Bearer ") === -1) {
    const logData = {
      ip: (req.headers['x-forwarded-for'] || '') || req.socket.remoteAddress,
      method: req.method,
      url: req.url,
      error: 'Unauthorized'
    }
    
    log.warn(ctx, logData)
    response.resUnauthorized(res, logData.error)
    return
  }

  let authPayload = req.headers.authorization.split(' ')[1]
  let authClaims = JSON.stringify(jwt.verify(authPayload, crypt.publicKey, jwtTokenOptions, (err, decoded) => {
    if (err) {
      log.error(ctx, err?.message)
      response.resUnauthorized(res)
      return ""
    }

    return decoded
  }))

  if (authClaims.length > 0) {
    req.headers["X-JWT-Claims"] = await crypt.encryptWithRSA(authClaims)
  } else {
    log.error(ctx, "Empty JWT Auth Claims")
    response.resUnauthorized(res)
    return
  }

  next()
}

export async function jwtRefresh(req: Request, res: Response, next: NextFunction) {
  const ctx = "jwt-refresh"

  if (!req.headers.authorization || req.headers.authorization.indexOf("Bearer ") === -1) {
    const logData = {
      ip: (req.headers['x-forwarded-for'] || '') || req.socket.remoteAddress,
      method: req.method,
      url: req.url,
      error: 'Unauthorized'
    }
    
    log.warn(ctx, logData)
    response.resUnauthorized(res, logData.error)
    return
  }

  let authPayload = req.headers.authorization.split(' ')[1]
  let authClaims = JSON.stringify(jwt.verify(authPayload, crypt.publicKey, jwtRefreshOptions, (err, decoded) => {
    if (err) {
      log.error(ctx, err?.message)
      response.resUnauthorized(res)
      return ""
    }

    return decoded
  }))

  if (authClaims.length > 0) {
    req.headers["X-JWT-Refresh"] = await crypt.encryptWithRSA(authClaims)
  } else {
    log.error(ctx, "Empty JWT Auth Claims")
    response.resUnauthorized(res)
    return
  }

  next()
}

export async function getAuthToken(payload: string | [] | {}) {
  return jwt.sign({data: payload}, crypt.privateKey, jwtTokenOptions)
}

export async function getRefreshToken(payload: string | [] | {}) {
  return jwt.sign({data: payload}, crypt.privateKey, jwtRefreshOptions)
}

export async function getClaims(data: string = "") {
  if (data.length > 0) {
    return JSON.parse(await crypt.decryptWithRSA(data))
  }

  return
}
