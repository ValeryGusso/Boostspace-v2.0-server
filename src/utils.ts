import { GoogleSpreadsheet } from 'google-spreadsheet'
import { Response } from 'express'
import sequelize from './postgres.js'

export async function connectToGSS(id: string = ''): Promise<GoogleSpreadsheet | null> {
  try {
    const doc = new GoogleSpreadsheet(id)

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
      private_key:
        process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n').replace('\u003d', '=') || '',
    })
    await doc.loadInfo()
    return doc
  } catch (err: any) {
    console.log('АШЫПКА', err?.message)
    return null
  }
}

export function dateToCompare(date: string) {
  return +date
    .split(/[\.,]/g)
    .reverse()
    .reduce(
      (acc, el) =>
        (acc += el.length === 1 ? '0' + el : el.length === 4 ? el.replace(/^../, '') : el),
      '',
    )
}

export function numParse(str: string) {
  if (!str) {
    return 0
  }
  const num = str.match(/\d+[\.,]\d\d/)
  if (num) {
    return +num[0].replace(',', '.')
  }
  return 0
}

export async function connectToPostgres() {
  await sequelize.authenticate()
  await sequelize.sync()
}

export function getRandom(min: number, max: number) {
  return Math.ceil(Math.random() * (max - min) + min)
}

export function setCookies(res: Response, cookie: string) {
  res.cookie('refreshToken', cookie, {
    maxAge: 30 * 24 * 3600 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: process.env.COOKIE_DOMAIN,
  })
}
