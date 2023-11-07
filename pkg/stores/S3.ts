import * as minio from "minio"
import s3encode from "s3encode"
import validate from "validate.js"

import * as config from "@pkg/config"

import * as log from "@utils/logger"
import * as string from "@utils/string"

var client: minio.Client

export async function connect() {
  if (validate.isEmpty(client)) {
    switch (config.schema.get("store.driver")) {
      case "aws":
        client = new minio.Client({
          endPoint: config.schema.get("store.endpoint") || "s3." + config.schema.get("store.region") + ".amazonaws.com",
          accessKey: config.schema.get("store.accesskey"),
          secretKey: config.schema.get("store.secretkey"),
          region: config.schema.get("store.region"),
          port: 443,
          useSSL: true,
          pathStyle: true
        })
        break

      case "oss":
        client = new minio.Client({
          endPoint: config.schema.get("store.endpoint") || "oss-" + config.schema.get("store.region") + ".aliyuncs.com",
          accessKey: config.schema.get("store.accesskey"),
          secretKey: config.schema.get("store.secretkey"),
          region: config.schema.get("store.region"),
          port: 443,
          useSSL: true,
          pathStyle: false
        })
        break

      case "storeio":
      case "minio":
        client = new minio.Client({
          endPoint: config.schema.get("store.endpoint"),
          accessKey: config.schema.get("store.accesskey"),
          secretKey: config.schema.get("store.secretkey"),
          region: config.schema.get("store.region"),
          port: config.schema.get("store.port"),
          useSSL: config.schema.get("store.useSSL"),
          pathStyle: true
        })
        break
    }
  }
}

export async function upload(bucket: string, file: string, path: string) {
  const ctx = "store-s3-upload"

  if (!validate.isEmpty(client)) {
    try {
      let isBucketExist = await client.bucketExists(bucket)
      if (!isBucketExist) {
        let isBucketCreated = await client.makeBucket(bucket, config.schema.get('store.region')).then(() => true).catch(() => false)
        if (isBucketCreated) {
          log.info(ctx, "Successfully Create Bucket \""+ bucket + "\"")
        } else {
          log.error(ctx, "Failed to Upload File \""+ file + "\" Cause By Failed to Create Bucket \""+ bucket + "\"")
          return false
        }
      }

      let isUploaded = await client.fPutObject(bucket, string.strSpaceToUnderscore(file), path)
      if (isUploaded) {
        log.info(ctx, "Successfully Upload File \""+ file + "\"")
        return true
      }

      log.error(ctx, "Failed to Upload File \""+ file + "\"")
    } catch(err: any) {
      log.error(ctx, string.strToTitleCase(err.message))
    }
  } else {
    log.error(ctx, "Store Client is Uninitialized")
  }

  return false
}

export async function remove(bucket: string, file: string) {
  const ctx = "store-s3-remove"

  if (!validate.isEmpty(client)) {
    try {
      let isBucketExist = await client.bucketExists(bucket)
      if (!isBucketExist) {
        log.error(ctx, "Failed to Remove File \""+ file + "\ Cause By Bucket Doesn't Exist")
        return false
      }

      let isRemoved = await client.removeObject(bucket, file).then(() => true).catch(() => false)
      if (isRemoved) {
        log.info(ctx, "Successfully Remove File \""+ file + "\"")
        return true
      }

      log.error(ctx, "Failed to Remove File \""+ file + "\"")
    } catch(err: any) {
      log.error(ctx, string.strToTitleCase(err.message))
    }
  } else {
    log.error(ctx, "Store Client is Uninitialized")
  }

  return false
}

export async function getURLFilePrivate(bucket: string, file: string) {
  const ctx = "store-s3-get-url-file-private"

  if (!validate.isEmpty(client)) {
    try {
      return await client.presignedGetObject(bucket, file, config.schema.get("store.expired"))
    } catch(err: any) {
      log.error(ctx, string.strToTitleCase(err.message))
    }
  } else {
    log.error(ctx, "Store Client is Uninitialized")
  }

  return ""
}

export async function getURLFilePublic(bucket: string, file: string) {
  const ctx = "store-s3-get-url-file-public"

  if (!validate.isEmpty(client)) {
    file = s3encode(file)
    switch (config.schema.get("store.driver")) {
      case "aws":
        return "https://s3." + config.schema.get("store.region") + ".amazonaws.com/" + bucket + "/" + file

        case "oss":
        return "https://" + bucket + ".oss-" + config.schema.get("store.region") + ".aliyuncs.com/" + file
        
      case "stroeio":
      case "minio":
        let protocol = "http://"
        if (config.schema.get("store.useSSL")) {
          protocol = "https://"
        }

        return protocol + config.schema.get("store.endpoint") + "/" + bucket + "/" + file
    }
  } else {
    log.error(ctx, "Store Client is Uninitialized")
  }

  return ""
}
