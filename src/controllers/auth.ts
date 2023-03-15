import { Request, Response } from 'express'
import { DTO } from '../dto.js'
import * as AuthServise from '../services/auth.js'
import { getOnyById } from '../services/player.js'
import * as TokenServise from '../services/token.js'
import { setCookies } from '../utils.js'
import MailService from '../services/mail.js'

export async function registration(req: Request, res: Response) {
  try {
    const { email, password, invite } = req.body
    const player = await AuthServise.registration(email, password, invite)

    const message = await MailService.sendCode(email, player.code)

    if (message.sended) {
      return res.json({ success: true, id: player.id })
    }

    return res.json({ success: false })
  } catch (err: any) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(403).json({ message: 'Пользователь уже существует.' })
    }

    if (err.message?.toLowerCase().includes('не')) {
      return res.status(424).json({ message: err.message })
    }
    return res.status(500).json({ message: 'Непредвиденная ошибка сервера.' })
  }
}

export async function activate(req: Request, res: Response) {
  try {
    const { id, code } = req.body

    const player = await AuthServise.activate(+id, +code)
    const playerDTO = DTO(player)

    const access = TokenServise.createAccess(player)
    const refresh = TokenServise.createRefresh(player.id, player.isAdmin!)

    await TokenServise.save(player.id, refresh)
    await TokenServise.clearDB(player.id)
    
    setCookies(res, refresh)

    return res.json({ player: playerDTO, access })
  } catch (err: any) {
    console.log(err)
    return res.status(500).json({ message: err.message })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { login, password } = req.body

    const player = await AuthServise.login(login, password)
    const playerDTO = DTO(player)

    const access = TokenServise.createAccess(player)
    const refresh = TokenServise.createRefresh(player.id, player.isAdmin!)

    await TokenServise.save(player.id, refresh)
    await TokenServise.clearDB(player.id)

    setCookies(res, refresh)

    return res.json({ player: playerDTO, access })
  } catch (err: any) {
    console.log(err)
    return res.status(500).json({ message: err.message })
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.cookies
    
    const success = await TokenServise.deleteToken(refreshToken)
  
    res.clearCookie('refreshToken')

    return res.json({ success })
  } catch (err: any) {
    console.log(err)
    return res.status(500).json({ message: err.message })
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const token = req.cookies.refreshToken

    if (!token) {
      return res.status(401).json({ message: 'Пользователь не авторизован!' })
    }

    const verify = TokenServise.verifyRefresh(token)

    if (!verify || typeof verify === 'string') {
      return res.status(401).json({ message: 'Пользователь не авторизован!' })
    }

    const player = await getOnyById(verify.id!)

    const access = TokenServise.createAccess(player)
    const refresh = TokenServise.createRefresh(player.id, player.isAdmin!)
    
    await TokenServise.save(player.id, refresh, token)
    await TokenServise.clearDB(player.id)

    setCookies(res, refresh)

    return res.json({ player, access })
  } catch (err: any) {
    console.log(err)
    return res.status(500).json({ message: err.message })
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    if (!req.player) {
      return res.status(401).json({ message: 'Пользователь не авторизован!' })
    }

    const player = await getOnyById(req.player.id)
    const playerDTO = DTO(player)
    
    return res.json({ player: playerDTO })
  } catch (err: any) {
    console.log(err)
    return res.status(500).json({ message: err.message })
  }
}
