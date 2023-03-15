import { TokenListModel, TokenModel } from './../interfaces/player.js'
import { CharacterModel, CharListModel, PlayerModel } from '../interfaces/player.js'
import sequelize from '../postgres.js'
import { DataTypes } from 'sequelize'

export const Player = sequelize.define<PlayerModel>('Player', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActivated: { type: DataTypes.BOOLEAN, defaultValue: false },
  isBanned: { type: DataTypes.BOOLEAN, defaultValue: false },
  inactive: { type: DataTypes.BOOLEAN, defaultValue: false },
  code: { type: DataTypes.INTEGER },
  name: { type: DataTypes.STRING, unique: true },
  nickname: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING },
  group: { type: DataTypes.SMALLINT },
  avatar: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
})


export const Character = sequelize.define<CharacterModel>('Character', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.STRING },
  class: { type: DataTypes.STRING },
  key: { type: DataTypes.STRING },
  lvl: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
})

export const CharList = sequelize.define<CharListModel>('CharList', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
})

export const TokenList = sequelize.define<TokenListModel>('TokenList', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
})

export const Token = sequelize.define<TokenModel>('Token', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  token: { type: DataTypes.STRING, unique: true },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
})

Player.hasOne(CharList)
CharList.belongsTo(Player)

Player.hasOne(TokenList)
TokenList.belongsTo(Player)

CharList.hasMany(Character)
Character.belongsTo(CharList)

TokenList.hasMany(Token)
Token.belongsTo(TokenList)

// Player.sync({ alter: true })
// Character.sync({ alter: true })