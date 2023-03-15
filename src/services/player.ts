import * as PlayerModels from '../models/models.js'
import bcrypt from 'bcrypt'
import { Op } from 'sequelize'
import { getRandom } from '../utils.js'

export async function getAll() {
  const data = await PlayerModels.Player.findAll({
    include: [{ all: true, nested: true }],
  })

  return data
}

export async function getOnyById(id: number) {
  const player = await PlayerModels.Player.findOne({
    where: { id },
    include: [{ all: true, nested: true }],
  })
  if (!player) {
    throw new Error('Пользователь не найден.')
  }
  return player
}

export async function updateKeys(
  id: number,
  type: string,
  classType?: string,
  key?: string,
  lvl?: string,
) {
  if (!id) {
    throw new Error('Необходимо указать ID пользователя.')
  }

  if (!type.match(/^(main|first|second|third)$/)) {
    throw new Error('Неверно указан тип персонажа.')
  }

  const charList = await PlayerModels.CharList.findOne({ where: { PlayerId: id } })

  if (!charList) {
    throw new Error('Пользователь не найден.')
  }

  const character = await PlayerModels.Character.findOne({
    where: { [Op.and]: [{ CharListId: charList.id }, { type }] },
  })

  if (!character) {
    throw new Error('Персонаж не найден.')
  } else {
    const clear = 'очистить'
    if (key === clear || lvl === clear) {
      character.update({ lvl: null, key: null })
    }

    if (classType) {
      character.update({ class: classType })
    }
    if (key && key !== clear) {
      character.update({ key })
    }
    if (lvl && lvl !== clear) {
      character.update({ lvl })
    }
    await character.save()
  }

  return true
}

type ICharList = {
  main?: string
  first?: string
  second?: string
  third?: string
}

export async function updatePlayer(
  id: number,
  name?: string,
  password?: string,
  avatar?: string,
  charList?: ICharList,
  role?: string,
  group?: number,
) {
  if (!id) {
    throw new Error('Необходимо указать ID пользователя.')
  }

  const player = await PlayerModels.Player.findByPk(id)

  if (!player) {
    throw new Error('Пользователь не найден.')
  }

  if (name) {
    if (name.length >= 3) {
      player.update({ name })
    } else {
      throw new Error('Имя не может быть короче 3 символов.')
    }
  }

  if (password) {
    if (password.length >= 5) {
      const salt = await bcrypt.genSalt(13)
      const hash = await bcrypt.hash(password, salt)
      player.update({ password: hash })
    } else {
      throw new Error('Пароль не может быть короче 5 символов.')
    }
  }

  if (role) {
    player.update({ role })
  }

  if (typeof group === 'number') {
    player.update({ group })
  }

  if (avatar) {
    player.update({ avatar })
  }

  if (charList) {
    const originalCharList = await PlayerModels.CharList.findByPk(player.id)

    if (originalCharList) {
      const characters = await PlayerModels.Character.findAll({
        where: { CharListId: originalCharList.id },
      })
      for (const key in charList) {
        if (charList[key as keyof ICharList]) {
          characters.forEach(async (el) => {
            if (el.type === key) {
              el.update({
                class:
                  charList[key as keyof ICharList] === 'remove'
                    ? null
                    : charList[key as keyof ICharList],
              })
              await el.save()
            }
          })
        }
      }
    } else {
      throw new Error('Пользователь не найден.')
    }
  }
  await player.save()
  return true
}

export async function resetPassword(email: string) {
  if (!email) {
    throw new Error('Необходимо указать почту для востановления!')
  }
  const player = await PlayerModels.Player.findOne({ where: { email } })

  if (!player) {
    throw new Error('Пользователь не найден.')
  }

  const newPass = getRandom(100_000, 1_000_000)
  const salt = await bcrypt.genSalt(13)
  const hash = await bcrypt.hash(newPass.toString(), salt)

  player.update({ password: hash })
  await player.save()

  return true
}

export async function updateByAdmin(
  id: number,
  name?: string,
  group?: number,
  inactive?: boolean,
  isBanned?: boolean,
) {
  if (!id) {
    throw new Error('Необходимо указать ID пользователя.')
  }

  const player = await PlayerModels.Player.findByPk(id)

  if (!player) {
    throw new Error('Пользователь не найден.')
  }

  if (name) {
    if (name.length >= 3) {
      player.update({ name })
    } else {
      throw new Error('Имя не может быть короче 3 символов.')
    }
  }

  if (typeof group === 'number') {
    player.update({ group })
  }

  if (typeof inactive === 'boolean') {
    player.update({ inactive })
  }

  if (typeof isBanned === 'boolean') {
    player.update({ isBanned })
  }

  await player.save()

  return true
}
