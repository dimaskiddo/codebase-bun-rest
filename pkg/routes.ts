import { Router } from "express"

import * as config from "@pkg/config"

import * as basic from "@auth/basic"
import * as jwt from "@auth/jwt"

import * as svcIndex from "@modules/index/service"
import * as svcUsers from "@modules/users/service"

export const router = Router()
export const routerPath = config.schema.get("server.router.path").replace(/\/+$/, '')

router.get(routerPath + "/", svcIndex.index)
router.get(routerPath + "/health", svcIndex.health)

router.get(routerPath + "/auth", basic.basicAuth, svcIndex.auth)
router.get(routerPath + "/auth/refresh", jwt.jwtRefresh, svcIndex.authRefresh)

router.get(routerPath + "/users", jwt.jwtAuth, svcUsers.index)
