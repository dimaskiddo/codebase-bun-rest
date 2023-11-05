import { Response } from "express"

function resWriter(res: Response, code: number, message: string) {
  res.status(code).json({
    status: true,
    code: code,
    message: message
  })
}

function resWriterData(res: Response, code: number, message: string, data: [] | {}) {
  res.status(code).json({
    status: true,
    code: code,
    message: message,
    data: data
  })
}

function resWriteError(res: Response, code: number, message: string, error: string) {
  res.status(code).json({
    status: true,
    code: code,
    message: message,
    error: error
  })
}

export function resSuccess(res: Response, message: string = "Success") {
  resWriter(res, 200, message)
}

export function resSuccessData(res: Response, data: [] | {}, message: string = "Success") {
  resWriterData(res, 200, message, data)
}

export function resCreated(res: Response, data: [] | {}) {
  resWriterData(res, 201, "Created", data)
}

export function resUpdated(res: Response, data: [] | {}) {
  resWriterData(res, 200, "Updated", data)
}

export function resBadRequest(res: Response, err: string = "Bad Request") {
  resWriteError(res, 400, "Bad Request", err)
}

export function resUnauthorized(res: Response, err: string = "Unauthorized") {
  resWriteError(res, 401, "Unauthorized", err)
}

export function resNotFound(res: Response, err: string = "Not Found") {
  resWriteError(res, 404, "Not Found", err)
}

export function resInternalError(res: Response, err: string = "Internal Server Error") {
  resWriteError(res, 500, "Internal Server Error", err)
}

export function resAuthenticate(res: Response) {
  res.set("WWW-Authenticate", "Basic realm=\"Authorization Required\"")
  resUnauthorized(res)
}
