import multer from "multer"

import * as config from "@pkg/config"

export const cache = multer({storage: multer.memoryStorage()})

export const upload = multer({ storage: multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.schema.get('server.upload.path'))
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname)
  }
})})
