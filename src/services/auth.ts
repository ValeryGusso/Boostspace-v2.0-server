import * as PlayerModels from '../models/models.js'
import { getRandom } from '../utils.js'
import bcrypt from 'bcrypt'
import { Op } from 'sequelize'
import { verifyInvite } from './token.js'

export async function registration(email: string, password: string, invite: string) {
  if (!email) {
    throw new Error('Не указана почта.')
  }
  if (!password) {
    throw new Error('Не указан пароль.')
  }
  if (!invite) {
    throw new Error('Не указан код-приглашение.')
  }

  const info = verifyInvite(invite)

  if (!info) {
    throw new Error('Код-приглашение недействителен.')
  }

  const samePlayer = await PlayerModels.Player.findOne({
    where: { email },
  })

  if (samePlayer?.isActivated) {
    await samePlayer.destroy()
  }

  const salt = await bcrypt.genSalt(13)
  const hash = await bcrypt.hash(password, salt)

  const code = getRandom(100_000, 1_000_000)
  const player = await PlayerModels.Player.create({
    email,
    password: hash,
    code,
    role: info.role,
    group: info.group,
    name: info.name,
    nickname: info.name,
  })

  const charList = await PlayerModels.CharList.create({ PlayerId: player.id })

  await PlayerModels.TokenList.create({ PlayerId: player.id })

  await PlayerModels.Settings.create({ PlayerId: player.id })

  await PlayerModels.Character.create({ CharListId: charList.id, type: 'main' })
  await PlayerModels.Character.create({ CharListId: charList.id, type: 'first' })
  await PlayerModels.Character.create({ CharListId: charList.id, type: 'second' })
  await PlayerModels.Character.create({ CharListId: charList.id, type: 'third' })

  return player
}

export async function login(login: string, password: string) {
  if (!login) {
    throw new Error('Не указан логин.')
  }
  if (!password) {
    throw new Error('Не указан пароль.')
  }

  const player = await PlayerModels.Player.findOne({
    where: {
      [Op.or]: [
        {
          email: login,
        },
        { name: { [Op.iRegexp]: login } },
        { nickname: { [Op.iRegexp]: login } },
      ],
    },
    include: [{ all: true, nested: true }],
  })

  if (!player) {
    throw new Error('Пользователь не найден.')
  }

  const isEquival = await bcrypt.compare(password, player.password)

  if (!isEquival) {
    throw new Error('Неверно указан пароль.')
  }

  return player
}

export async function activate(id: number, code: number) {
  if (!id) {
    throw new Error('Необходимо указать ID пользователя.')
  }

  const player = await PlayerModels.Player.findByPk(id)

  if (!player) {
    throw new Error('Пользователь не найден.')
  }

  if (player.code === code) {
    player.update({ isActivated: true })
    await player.save()
  } else {
    throw new Error('Неверный код активации.')
  }

  return player
}
