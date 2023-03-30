import { Request, Response } from 'express'
import Timer from '../timer.js'

export async function uptime(req: Request, res: Response) {
  try {
    return res.json({ uptime: Timer.getUptime() })
  } catch (err: any) {
    return res.status(500).json({ message: err.message })
  }
}
