import { PlayerToken } from '../services/token.js'

declare global {
  namespace Express {
    interface Request {
      isAdmin?: boolean
      player?: PlayerToken
    }
  }
}
