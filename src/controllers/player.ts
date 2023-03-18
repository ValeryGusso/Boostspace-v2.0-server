import { Request, Response } from 'express'
import { DTO, PlayerDTO } from '../dto.js'
import * as PlayerServise from '../services/player.js'
import { createInvite } from '../services/token.js'

async function getAllUsersData() {
  const data = await PlayerServise.getAll()

  const playersDTO: PlayerDTO[] = []
  const groupSet = new Set<number>()

  data.forEach((player) => {
    playersDTO.push(DTO(player))
    groupSet.add(player.group || 0)
  })

  const groupList: number[] = [...groupSet]
  groupList.sort()

  if (groupList[0] === 0) {
    const first = groupList.shift()
    groupList.push(first!)
  }

  playersDTO.sort((a, b) => a.group - b.group)

  while (playersDTO[0]?.group === 0) {
    const first = playersDTO.shift()
    if (first) {
      playersDTO.push(first)
    }
  }

  return { total: playersDTO.length, data: playersDTO, groupList }
}

export async function getAll(req: Request, res: Response) {
  try {
    const data = await getAllUsersData()

    return res.json({ ...data })
  } catch (err: any) {
    console.log(err)
    return res.status(500).json({ message: err.message, success: false })
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const { id } = req.body

    const player = await PlayerServise.getOnyById(id)
    const playerDTO = DTO(player)

    return res.json({ player: playerDTO })
  } catch (err: any) {
    console.log(err)
  }
}

export async function updatePlayer(req: Request, res: Response) {
  try {
    const { id, name, password, avatar, charList, role, group } = req.body

    const success = await PlayerServise.updatePlayer(
      id,
      name,
      password,
      avatar,
      charList,
      role,
      group,
    )

    if (success) {
      const player = await PlayerServise.getOnyById(id)
      const playerDTO = DTO(player)

      return res.json({ player: playerDTO, success })
    }

    return res.json({ player: null, success })
  } catch (err: any) {
    console.log(err)
    return res.status(500).json({ message: err.message, success: false })
  }
}

export async function updateCharacter(req: Request, res: Response) {
  try {
    const { id, type, class: classType, key, lvl } = req.body

    const success = await PlayerServise.updateKeys(id, type, classType, key, lvl)

    if (success) {
      const data = await getAllUsersData()
      return res.json({ ...data, success })
    }

    return res.json({ success })
  } catch (err: any) {
    console.log(err)
    return res.status(500).json({ message: err.message, success: false })
  }
}

export async function invite(req: Request, res: Response) {
  try {

    if (!req.isAdmin) {
      return res.json({
        success: false,
        message: 'Данный функционал доступен только администраторам!',
      })
    }
    
    const { name, group, role } = req.body

    const invite = createInvite(name, group, role)

    return res.json({ invite, success: true })
  } catch (err: any) {
    console.log(err)
    return res.status(500).json({ message: err.message, success: false })
  }
}

export async function updateByAdmin(req: Request, res: Response) {
  try {
    if (!req.isAdmin) {
      return res.json({
        success: false,
        message: 'Данный функционал доступен только администраторам!',
      })
    }

    const { id, name, group, inactive, isBanned } = req.body

    const success = await PlayerServise.updateByAdmin(id, name, group, inactive, isBanned)

    return res.json({ success, id })
  } catch (err: any) {
    console.log(err)
    return res.status(500).json({ message: err.message, success: false })
  }
}
