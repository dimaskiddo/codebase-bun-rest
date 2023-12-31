import mysql from "mysql2"
import validate from "validate.js"

import * as config from "@pkg/config"

import * as log from "@utils/logger"
import * as string from "@utils/string"

var client: mysql.Pool

export async function connect() {
  const ctx = "db-mysql-connect"

  if (validate.isEmpty(client)) {
    client = mysql.createPool({
      host: config.schema.get("rdb.host"),
      port: config.schema.get("rdb.port"),
      user: config.schema.get("rdb.username"),
      password: config.schema.get("rdb.password"),
      database: config.schema.get("rdb.name")
    })

    if (!await ping()) {
      log.error(ctx, "Failed to Connect MySQL Database")
    }
  }
}

export async function ping() {
  const ctx = "db-mysql-ping"
  
  if (!validate.isEmpty(client)) {
    try {
      let status = await new Promise<boolean>((resolve, reject) => {
        client.getConnection((err, conn) => {
          if (err) {
            if (conn) conn.release()
            reject(err)
          }
          if (conn) {
            conn.ping((err) => {
              conn.release()
              if (err) reject(err)
            })
            resolve(true)
          }
        })
      })

      return status
    } catch(err: any) {
      log.error(ctx, "Failed to Ping MySQL Database")
    }
  } else {
    log.error(ctx, "MySQL Client is Uninitialized")
  }

  return false
}

export async function query(statement: string, data: {} | null = null) {
  const ctx = "db-mysql-query"

  if (!validate.isEmpty(client)) {
    try {
      let recordSet = await new Promise<mysql.Query>((resolve, reject) => {
        client.getConnection((err, conn) => {
          if (err) {
            if (conn) conn.release()
            reject(err)
          }
          if (conn) {
            let result = conn.query(statement, data, (err) => {
              conn.release()
              if (err) reject(err)
            })
            resolve(result)
          }
        })
      })

      return recordSet
    } catch(err: any) {
      log.error(ctx, "Failed to Query to MySQL Database Caused By " + string.strToTitleCase(err.message))
    }
  } else {
    log.error(ctx, "MySQL Client is Uninitialized")
  }

  return null
}

export async function close() {
  const ctx = "db-mysql-close"

  if (!validate.isEmpty(client)) {
    try {
      let status = await new Promise<boolean>((resolve, reject) => {
        client.end((err) => {
          if (err) reject(err)
        })
        resolve(true)
      })

      return status
    } catch(err: any) {
      log.error(ctx, "Failed to Close MySQL Database")
    }
  } else {
    log.error(ctx, "MySQL Client is Uninitialized")
  }

  return false
}
