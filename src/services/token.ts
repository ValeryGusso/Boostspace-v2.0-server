// import { Token } from './../models/models'
import jwt from 'jsonwebtoken'
import * as PlayerModels from '../models/models.js'
import { PlayerModel } from '../interfaces/player.js'

export interface PlayerToken extends jwt.JwtPayload {
  id: number
  email: string
  name: string
  isAdmin: boolean
  isActivated: boolean
  role: string
  group: number
  avatar: string
}

export interface InviteToken extends jwt.JwtPayload {
  name: string
  group: number
  role: string
}

export function createAccess(player: PlayerModel) {
  const { id, email, name, isAdmin, isActivated, role, group, avatar } = player
  const token = jwt.sign(
    { id, email, name, isAdmin, isActivated, role, group, avatar },
    process.env.TOKEN_ACCESS_KEY!,
    { expiresIn: '1h' },
  )
  return token
}

export function verifyAccess(token: string) {
  try {
    const verify = jwt.verify(token, process.env.TOKEN_ACCESS_KEY!)

    if (!verify || typeof verify === 'string') {
      return null
    }

    return { ...verify } as PlayerToken
  } catch (err) {
    return null
  }
}

export function createRefresh(id: number, isAdmin: boolean) {
  const token = jwt.sign({ id, isAdmin }, process.env.TOKEN_REFRESH_KEY!, { expiresIn: '30d' })
  return token
}

export function verifyRefresh(token: string) {
  try {
    const verify = jwt.verify(token, process.env.TOKEN_REFRESH_KEY!)

    if (!verify) {
      return null
    }

    return verify
  } catch (err) {
    return null
  }
}

export async function save(id: number, token: string, oldToken?: string) {
  const check = await PlayerModels.Token.findOne({ where: { token } })
  if (check) {
    await check.destroy()
    throw new Error('Токен уже существует.')
  }
  const tokenList = await PlayerModels.TokenList.findOne({ where: { PlayerId: id } })

  if (!tokenList) {
    throw new Error('ID пользователя указан неверно.')
  }

  if (oldToken) {
    const old = await PlayerModels.Token.findOne({ where: { token: oldToken } })
    old?.destroy()
  }

  await PlayerModels.Token.create({ TokenListId: tokenList.id, token })
  return true
}

export async function clearDB(id: number) {
  const tokenList = await PlayerModels.TokenList.findOne({ where: { PlayerId: id } })

  if (!tokenList!) {
    throw new Error('ID пользователя указан неверно.')
  }

  const tokens = await PlayerModels.Token.findAll({ where: { TokenListId: tokenList.id } })

  for (let i = 0; i < tokens.length; ) {
    const created = new Date(tokens[i].createdAt!).getTime()
    const updated = new Date(tokens[i].updatedAt!).getTime()
    const now = new Date().getTime()
    const limit = 5_184_000_000

    if (created !== updated) {
      if (now - updated > limit) {
        await tokens[i].destroy()
      }
    } else {
      if (now - created > limit) {
        await tokens[i].destroy()
      }
    }
    i++
  }
}

export async function deleteToken(token: string) {
  const check = await PlayerModels.Token.findOne({ where: { token } })
  if (!check) {
    throw new Error('Токен не найден!')
  }
  await check.destroy()
  return true
}

export function createInvite(name: string = '', group: number = 0, role: string = '') {
  const token = jwt.sign({ name, group, role }, process.env.TOKEN_INVITE_KEY!, { expiresIn: '5m' })
  return token
}

export function verifyInvite(token: string) {
  try {
    const verify = jwt.verify(token, process.env.TOKEN_INVITE_KEY!)

    if (!verify || typeof verify === 'string') {
      return null
    }
    return { ...verify } as InviteToken
  } catch (error) {
    return null
  }
}
