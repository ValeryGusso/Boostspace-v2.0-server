import { PlayerModel } from './interfaces/player.js'

export interface PlayerDTO {
  id: number
  email: string
  isAdmin: boolean
  isActivated: boolean
  isBanned: boolean
  inactive: boolean
  name: string
  nickname: string
  role: string
  group: number
  avatar: string
  charList: Character[] | null
}

export interface Character {
  type: string
  class: string | null
  key: string | null
  lvl: string | null
}

export function DTO(player: PlayerModel) {
  const data = {} as PlayerDTO
  data.id = player.id
  data.email = player.email
  data.isAdmin = player.isAdmin || false
  data.isActivated = player.isActivated || false
  data.isBanned = player.isBanned || false
  data.inactive = player.inactive || false
  data.name = player.name || ''
  data.nickname = player.nickname || ''
  data.role = player.role || ''
  data.group = player.group || 0
  data.avatar = player.avatar || ''
  data.charList = null
  if (player?.CharList?.Characters) {
    const order = ['main', 'first', 'second', 'third']
    const charListDTO: Character[] = []
    player.CharList.Characters.forEach((el) => {
      charListDTO[order.indexOf(el.type)] = {
        type: el.type,
        class: el.class!,
        key: el.key!,
        lvl: el.lvl!,
      } as Character
    })
    data.charList = charListDTO
  }
  return data
}
