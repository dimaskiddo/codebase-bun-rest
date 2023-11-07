import { Response } from "express"

import * as config from "@pkg/config"

import * as log from "@utils/logger"
import * as response from "@utils/response"

import * as mysql from "@dbs/mysql"
import * as redis from "@dbs/redis"

export async function check(res: Response) {
  const ctx = "health-check"

  switch (config.schema.get("rdb.driver")) {
    case "mysql":
    case "mariadb":
      if (!await mysql.ping()) {
        log.error(ctx, "Failed to Ping MySQL Database")
        response.resInternalError(res, "Failed to Ping MySQL Database")
        return
      }
      break
  }

  if (config.schema.get("redis.enabled")) {
    if (!await redis.ping()) {
      log.error(ctx, "Failed to Ping Redis Database")
      response.resInternalError(res, "Failed to Ping Redis Database")
      return
    }
  }
  
  response.resSuccess(res, "Service Health Check Status is OK")
}
