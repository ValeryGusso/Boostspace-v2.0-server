import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from 'sequelize'

export interface PlayerModel
  extends Model<InferAttributes<PlayerModel>, InferCreationAttributes<PlayerModel>> {
  id: CreationOptional<number>
  email: string
  password: string
  code: number
  isAdmin?: boolean
  isActivated?: boolean
  isBanned?: boolean
  inactive?: boolean
  name?: string
  nickname?: string
  role?: string
  group?: number
  avatar?: string
  invite?: string
  CharList?: CharListModel
  createdAt?: CreationOptional<Date>
  updatedAt?: CreationOptional<Date>
}

export interface CharacterModel
  extends Model<InferAttributes<CharacterModel>, InferCreationAttributes<CharacterModel>> {
  id: CreationOptional<number>
  type: 'main' | 'first' | 'second' | 'third'
  class?: string | null
  key?: string | null
  lvl?: string | null
  CharListId?: number
  createdAt?: CreationOptional<Date>
  updatedAt?: CreationOptional<Date>
}

export interface CharListModel
  extends Model<InferAttributes<CharListModel>, InferCreationAttributes<CharListModel>> {
  id: CreationOptional<number>
  PlayerId?: number
  Characters?: CharacterModel[]
  createdAt?: CreationOptional<Date>
  updatedAt?: CreationOptional<Date>
}

export interface TokenListModel
  extends Model<InferAttributes<TokenListModel>, InferCreationAttributes<TokenListModel>> {
  id: CreationOptional<number>
  PlayerId?: number
  createdAt?: CreationOptional<Date>
  updatedAt?: CreationOptional<Date>
}

export interface TokenModel
  extends Model<InferAttributes<TokenModel>, InferCreationAttributes<TokenModel>> {
  id: CreationOptional<number>
  token: string
  TokenListId?: number
  createdAt?: CreationOptional<Date>
  updatedAt?: CreationOptional<Date>
}
