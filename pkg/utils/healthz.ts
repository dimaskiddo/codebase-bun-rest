import { Response } from "express"

import * as config from "@pkg/config"

import * as log from "@utils/logger"
import * as response from "@utils/response"

import * as mysql from "@dbs/mysql"

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

  response.resSuccess(res, "Health Check Status is OK")
}
