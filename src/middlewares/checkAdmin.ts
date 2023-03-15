import { NextFunction, Request, Response } from 'express'
import { verifyRefresh } from '../services/token.js'

export function checkAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.refreshToken

    if (!token) {
      return res.status(401).json({ message: 'Пользователь не авторизован!' })
    }

    const verify = verifyRefresh(token)

    if (verify && typeof verify !== 'string') {
      req.isAdmin = verify.isAdmin
    } else {
      req.isAdmin = false
    }

    return next()
  } catch (err: any) {
    return res.status(401).json({ message: err.message })
  }
}
