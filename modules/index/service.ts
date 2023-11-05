import { Request, Response } from "express"

import * as jwt from "@auth/jwt"

import * as healthz from "@utils/healthz"
import * as response from "@utils/response"

export async function index(req: Request, res: Response) {
  response.resSuccess(res, "Codebase Bun REST is running")
}

export async function health(req: Request, res: Response) {
  await healthz.check(res)
}

export async function auth(req: Request, res: Response) {
  let body = JSON.parse(req.body)

  response.resSuccessData(res, {
    token: {
      auth: await jwt.getAuthToken({username: body.username}),
      refresh: await jwt.getRefreshToken({username: body.username})
    }
  })
}

export async function authRefresh(req: Request, res: Response) {
  let claims = await jwt.getClaims(req.headers['X-JWT-Refresh']?.toString())

  response.resSuccessData(res, {
    token: {
      auth: await jwt.getAuthToken({username: claims.data.username}),
      refresh: await jwt.getRefreshToken({username: claims.data.username})
    }
  })
}
