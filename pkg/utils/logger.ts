import winston from "winston"
import moment from "moment-timezone"
import stack from "stack-trace"

import * as config from "@pkg/config"

function logger() {
  return new winston.Logger({
    transports: [
      new winston.transports.Console({
        label: getStackTrace(),
        level: config.schema.get("log.level"),
        handleExceptions: true,
        humanReadableUnhandledException: true,
        align: true,
        colorize: true,
        json: false    
      })
    ],
    exitOnError: false
  })
}

function getTimestamp() {
  return moment().tz(config.schema.get("timezone")).format("YYYY-MM-DDTHH:mm:ss.SSSZ")
}

function getStackTrace() {
  const trace = stack.get()[4]
  return trace.getFileName().replace(/^.*[\\/]/, "") + ":" + trace.getLineNumber() + ":" + trace.getColumnNumber()
}

export function debug(context: string, message: any) {
  if (config.schema.get("environment") !== "prodcution") {
    const meta = {
      time: getTimestamp(),
      context,
      message
    }

    logger().debug("\t", meta)
  }
}

export function verbose(context: string, message: any) {
  const meta = {
    time: getTimestamp(),
    context,
    message
  }
  
  logger().verbose("\t", meta)
}

export function info(context: string, message: any) {
  const meta = {
    time: getTimestamp(),
    context,
    message
  }
  
  logger().info("\t", meta)
}

export function warn(context: string, message: any) {
  const meta = {
    time: getTimestamp(),
    context,
    message
  }
  
  logger().warn("\t", meta)
}

export function error(context: string, message: any) {
  const meta = {
    time: getTimestamp(),
    context,
    message
  }
  
  logger().error("\t", meta)
}
