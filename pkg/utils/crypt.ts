import fs from "fs"
import crypto from "crypto"

import * as config from "@pkg/config"

export const privateKey = fs.readFileSync(config.schema.get("key.private"), "utf-8")
export const publicKey = fs.readFileSync(config.schema.get("key.public"), "utf-8")

export async function encryptWithRSA(str: string) {
  return crypto.publicEncrypt(publicKey, Buffer.from(str)).toString("base64")
}

export async function decryptWithRSA(str: string) {
  return crypto.privateDecrypt(privateKey, Buffer.from(str, "base64")).toString("utf-8")
}
