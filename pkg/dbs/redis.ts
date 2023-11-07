import redis from "redis"
import validate from "validate.js"

import * as config from "@pkg/config"

import * as log from "@utils/logger"
import * as string from "@utils/string"

var client: redis.RedisClientType

export async function connect() {
  const ctx = "db-redis-connect"

  if (validate.isEmpty(client)) {
    client = redis.createClient({
      url: "redis://" + config.schema.get("redis.host") + ":" + config.schema.get("redis.port"),
      database: config.schema.get("redis.database")
    })

    if (!await ping()) {
      log.error(ctx, "Failed to Connect Redis Database")
    }
  }
}

export async function ping() {
  const ctx = "db-redis-ping"

  if (!validate.isEmpty(client)) {
    try {
      return await client.ping().then(() => true).catch(() => false)
    } catch(err: any) {
      log.error(ctx, "Failed to Ping Redis Database")
    }
  } else {
    log.error(ctx, "Redis Client is Uninitialized")
  }

  return false
}

export async function close() {
  const ctx = "db-redis-close"

  if (!validate.isEmpty(client)) {
    try {
      await client.quit()
    } catch(err: any) {
      log.error(ctx, "Failed to Close Redis Database")
    }
  } else {
    log.error(ctx, "Redis Client is Uninitialized")
  }
}
