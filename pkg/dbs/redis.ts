import redis from "redis"
import validate from "validate.js"

import * as config from "@pkg/config"

import * as log from "@utils/logger"
import * as string from "@utils/string"

var client: redis.RedisClientType

export async function connect() {
  const ctx = "db-redis-connect"

  if (config.schema.get("redis.enabled")) {
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
}

export async function ping() {
  const ctx = "db-redis-ping"

  if (!validate.isEmpty(client)) {
    try {
      await client.ping()
      return true
    } catch(err: any) {
      log.error(ctx, "Failed to Ping Redis Database")
    }
  } else {
    log.error(ctx, "Redis Client is Uninitialized")
  }

  return false
}

export async function listKey() {
  const ctx = "db-redis-get-key"

  if (!validate.isEmpty(client)) {
    try {
      return await client.keys("*")
    } catch(err: any) {
      log.error(ctx, "Failed to List Key from Redis Database Caused By " + string.strToTitleCase(err.message))
    }
  } else {
    log.error(ctx, "Redis Client is Uninitialized")
  }

  return []
}

export async function getKey(key: string) {
  const ctx = "db-redis-get-key"

  if (!validate.isEmpty(client)) {
    try {
      return await client.get(key)
    } catch(err: any) {
      log.error(ctx, "Failed to Get Key from Redis Database Caused By " + string.strToTitleCase(err.message))
    }
  } else {
    log.error(ctx, "Redis Client is Uninitialized")
  }

  return null
}

export async function getKeyExpireTime(key: string) {
  const ctx = "db-redis-get-key-expire-time"

  if (!validate.isEmpty(client)) {
    try {
      return await client.ttl(key)
    } catch(err: any) {
      log.error(ctx, "Failed to Get Key Expire Time from Redis Database Caused By " + string.strToTitleCase(err.message))
    }
  } else {
    log.error(ctx, "Redis Client is Uninitialized")
  }

  return 0
}

export async function setKey(key: string, value: string) {
  const ctx = "db-redis-set-key"

  if (!validate.isEmpty(client)) {
    try {
      await client.set(key, value)
      return true
    } catch(err: any) {
      log.error(ctx, "Failed to Set Key to Redis Database Caused By " + string.strToTitleCase(err.message))
    }    
  } else {
    log.error(ctx, "Redis Client is Uninitialized")
  }

  return false
}

export async function setKeyExpired(key: string, value: string, expired: number) {
  const ctx = "db-redis-set-key-expired"

  if (!validate.isEmpty(client)) {
    try {
      await client.setEx(key, expired, value)
      return true
    } catch(err: any) {
      log.error(ctx, "Failed to Set Key with Expiration Time to Redis Database Caused By " + string.strToTitleCase(err.message))
    }
  } else {
    log.error(ctx, "Redis Client is Uninitialized")
  }

  return false
}

export async function deleteKey(key: string) {
  const ctx = "db-redis-delete-key"

  if (!validate.isEmpty(client)) {
    try {
      await client.del(key)
      return true
    } catch(err: any) {
      log.error(ctx, "Failed to Delete Key from Redis Database Caused By " + string.strToTitleCase(err.message))
    }
  } else {
    log.error(ctx, "Redis Client is Uninitialized")
  }

  return false
}

export async function publish(channel: string, message: string) {
  const ctx = "db-redis-publish"

  if (!validate.isEmpty(client)) {
    try {
      await client.publish(channel, message)
      return true
    } catch(err: any) {
      log.error(ctx, "Failed to Publish Message to Redis Channel Caused By " + string.strToTitleCase(err.message))
    }
  } else {
    log.error(ctx, "Redis Client is Uninitialized")
  }

  return false
}

export async function subscribe(channel: string, handler: any) {
  const ctx = "db-redis-subscribe"

  if (!validate.isEmpty(client)) {
    try {
      await client.subscribe(channel, handler)
    } catch(err: any) {
      log.error(ctx, "Failed to Subscribe Message from Redis Channel Caused By " + string.strToTitleCase(err.message))
    }
  } else {
    log.error(ctx, "Redis Client is Uninitialized")
  }
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
