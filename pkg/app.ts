import express, { Request, Response, NextFunction } from "express"

import cors from "cors"
import helmet from "helmet"
import cookieparser from "cookie-parser"
import expressua from "express-useragent"

import * as config from "@pkg/config"
import * as routes from "@pkg/routes"

import * as log from "@utils/logger"
import * as string from "@utils/string"
import * as response from "@utils/response"

import * as mysql from "@dbs/mysql"
import * as redis from "@dbs/redis"

import * as mailer from "@mail/mailer"

import * as kafka from "@queue/kafka"

import * as multer from "@stores/multer"
import * as S3 from "@stores/S3"

const app = express()
const ctx = "http-server"

switch (config.schema.get("rdb.driver")) {
  case "mysql":
  case "mariadb":
    await mysql.connect()
    break
}

if (config.schema.get("redis.enabled")) {
  await redis.connect()
}

switch (config.schema.get("store.driver")) {
  case "aws":
  case "oss":
  case "storeio":
  case "minio":
    await S3.connect()
    break
}

if (config.schema.get("mail.enabled")) {
  await mailer.connect()
}

app.use(helmet())
app.use(cookieparser())
app.use(multer.cache.any())
app.use(express.json())
app.use(express.urlencoded({
  extended: false,
  limit: config.schema.get("server.upload.limit") + "mb"
}))
app.use(expressua.express())
app.use(cors({
  origin: config.schema.get("server.cors.origins"),
  methods: config.schema.get("server.cors.methods"),
  allowedHeaders: config.schema.get("server.cors.headers")
}))
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.url !== "/favicon.ico") {
    const logData = {
      ip: req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip,
      method: req.method,
      url: req.url
    }

    log.info(ctx, logData)
  }
  next()
})

app.use("/", routes.router)

app.get('/favicon.ico', (req: Request, res: Response) => {
  res.status(204)
})

app.use((req: Request, res: Response, next: NextFunction) => {
  const logData = {
    ip: req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip,
    method: req.method,
    url: req.url,
    error: "Not Found"
  }

  log.warn(ctx, logData)
  response.resNotFound(res)
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const logData = {
    ip: req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip,
    method: req.method,
    url: req.url,
    error: string.strToTitleCase(err.message)
  }

  log.warn(ctx, logData)
  response.resInternalError(res, logData.error)
})

app.set("trust proxy", config.schema.get("server.proxy.trust"))

const serverListen = app.listen(config.schema.get("server.port"), config.schema.get("server.address"), () => {
  log.info(ctx, "Server Started at PID " + process.pid + " Listen on " + config.schema.get("server.address") + ":" + config.schema.get("server.port"))
})

async function serverShutdown() {
  serverListen.close()

  switch (config.schema.get("rdb.driver")) {
    case "mysql":
    case "mariadb":
      await mysql.close()
      break
  }

  if (config.schema.get("redis.enabled")) {
    await redis.close()
  }

  if (config.schema.get("kafka.enabled")) {
    await kafka.close()
  }
  
  log.info(ctx, "Server Shutdown Gracefully")
  process.exit(0)
}

const signalShutdown = ["SIGUSR1", "SIGUSR2", "SIGINT", "SIGTERM", "SIGKILL"]
signalShutdown.map(signal => {
  process.once(signal, async () => {
    console.log("")
    log.info(ctx, "Server Shutdown Caused by Signal " + signal)
    serverShutdown()
  })
})
