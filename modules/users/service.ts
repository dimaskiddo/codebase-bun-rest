import { Request, Response } from "express"

import * as jwt from "@auth/jwt"
import * as response from "@utils/response"

export async function index(req: Request, res: Response) {
  let claims = await jwt.getClaims(req.headers['X-JWT-Claims']?.toString())  
  response.resSuccessData(res, claims.data)
}
