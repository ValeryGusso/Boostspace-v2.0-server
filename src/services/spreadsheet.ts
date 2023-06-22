import dotenv from 'dotenv'
import { Row } from '../interfaces/data.js'
import { Payments, PaymentsPlayer } from '../interfaces/payment.js'
import { Total, TotalResponse, TotalsPlayer } from '../interfaces/total.js'
import { connectToGSS, dateToCompare, numParse } from '../utils.js'

dotenv.config()

const TAX = (process.env.TAX && +process.env.TAX) || 0.08
const doc = await connectToGSS(process.env.GOOGLE_SHEET_ID)

interface PaymentsList {
  data: PaymentsPlayer[]
  periods: string[]
}

export async function getAllOrders(): Promise<Row[]> {
  const ss = await doc?.sheetsById[724529601].getRows()

  if (!ss) {
    throw new Error('Spreadsheet not found')
  }

  const data: Row[] = []

  ss.forEach((row) => {
    if (row._rawData[0]) {
      const info: Row = {
        row: row._rowNumber - 1,
        date: row._rawData[0],
        type: row._rawData[1],
        group: row._rawData[2],
        number: row._rawData[3],
        price: row._rawData[4],
        shop: row._rawData[7],
        description: row._rawData[8],
        currency: row._rawData[4]?.includes('$') ? 'usd' : 'rub',
        tax: !!row._rawData[6]?.match(/истина|true/i),
        done: !!row._rawData[9]?.match(/истина|true/i),
      }

      data.push(info)
    }
  })

  return data
}

export function sortOrders(data: Row[], from: string, to: string): Row[] {
  if (!data) {
    new Error('Orders not found')
  }

  if (!to && !from) {
    return data
  }

  let sortedData: Row[] = []

  if (from && to) {
    sortedData = data.filter((el) => {
      return (
        dateToCompare(el.date) >= dateToCompare(from) && dateToCompare(el.date) <= dateToCompare(to)
      )
    })
  }

  if (from && !to) {
    sortedData = data.filter((el) => dateToCompare(el.date) >= dateToCompare(from))
  }

  if (to && !from) {
    sortedData = data.filter((el) => dateToCompare(el.date) <= dateToCompare(to))
  }

  return sortedData
}

export async function getPaymentsList(): Promise<PaymentsList> {
  const ss = await doc?.sheetsById[1692055702].getRows()

  if (!ss) {
    throw new Error('Spreadsheet not found')
  }

  const periods: string[] = ss[0]._sheet.headerValues.filter(
    (el: string) => el && el.toLowerCase() !== 'период',
  )

  const data: PaymentsPlayer[] = []

  ss.forEach((row) => {
    const name: string = row._rawData[0]
    if (name && !name.match(/всего|проверка/i)) {
      const payments: Payments = {}
      const paid = { usd: 0, rub: 0 }

      periods.forEach((period: string, index: number) => {
        payments[period] = {
          overall: !row._rawData[index * 2 + 1]?.match(/^0[\.,]00/)
            ? row._rawData[index * 2 + 1] || null
            : null,
          paid: !row._rawData[index * 2 + 2]?.match(/^0[\.,]00/)
            ? row._rawData[index * 2 + 2] || null
            : null,
          currency: row._rawData[index * 2 + 1]?.includes('$') ? 'usd' : 'rub',
        }
        if (!row._rawData[index * 2 + 2]?.match(/^0[\.,]00/)) {
          paid.usd += numParse(row._rawData[index * 2 + 2])
        }
      })

      data.push({
        name,
        payments,
        total: { usd: 0, rub: 0 },
        paid,
      })
    }
  })

  return { data, periods }
}

// *****this function mutate original data***** //
export async function calculateSalary(userList: PaymentsPlayer[]): Promise<void> {
  const orders = await doc?.sheetsById[724529601].getRows()

  if (!userList) {
    throw new Error('Users not found')
  }

  if (!orders) {
    throw new Error('Spreadsheet not found')
  }

  orders.forEach((row) => {
    const group: string[] = row._rawData[2].split(/[\.,]\s*/g)
    const amount = group.length
    const price = numParse(row._rawData[4])
    const currency = row._rawData[4]?.includes('$') ? 'usd' : 'rub'
    const tax = !!row._rawData[6]?.match(/истина|true/i)

    group.forEach((player: string) => {
      const match = userList.filter((el) => el.name === player)[0]

      if (match) {
        if (tax) {
          currency === 'usd'
            ? (match.total.usd += (price - price * TAX) / amount)
            : (match.total.rub += (price - price * TAX) / amount)
        } else {
          currency === 'usd'
            ? (match.total.usd += price / amount)
            : (match.total.rub += price / amount)
        }
      }
    })

    const taxMatch = userList.filter((el) => el.name === '%')[0]

    if (tax) {
      currency === 'usd' ? (taxMatch.total.usd += price * TAX) : (taxMatch.total.rub += price * TAX)
    }
  })
}

export async function getAllPlayers(): Promise<string[]> {
  const ss = await doc?.sheetsById[724529601].getRows()

  if (!ss) {
    throw new Error('Spreadsheet not found')
  }

  const playerList = new Set<string>()
  ss.forEach((row) => {
    const group: string[] = row._rawData[2].split(/[\.,]\s*/g)
    group.forEach((player) => {
      player && playerList.add(player)
    })
  })

  return [...playerList].sort()
}

export async function calculateTotal(userList: string[]): Promise<TotalResponse> {
  const ss = await doc?.sheetsById[724529601].getRows()

  if (!ss) {
    throw new Error('Spreadsheet not found')
  }

  const data: TotalsPlayer[] = []
  const total: Total = { usd: 0, rub: 0 }

  userList.forEach((el) => data.push({ name: el, usd: 0, rub: 0 }))

  ss.forEach((row) => {
    const group: string[] = row._rawData[2].split(/[\.,]\s*/g)
    const amount = group.length
    const price = numParse(row._rawData[4])
    const currency = row._rawData[4]?.includes('$') ? 'usd' : 'rub'
    const tax = !!row._rawData[6]?.match(/истина|true/i)

    group.forEach((player: string) => {
      const match = data.filter((el) => el.name === player)[0]

      if (match) {
        if (tax) {
          currency === 'usd'
            ? (match.usd += (price - price * TAX) / amount)
            : (match.rub += (price - price * TAX) / amount)
        } else {
          currency === 'usd' ? (match.usd += price / amount) : (match.rub += price / amount)
        }
      }
    })
    const taxMatch = data.filter((el) => el.name === '%')[0]

    if (taxMatch && tax) {
      currency === 'usd' ? (taxMatch.usd += price * TAX) : (taxMatch.rub += price * TAX)
    }

    currency === 'usd' ? (total.usd += price) : (total.rub += price)
  })

  return { data, total }
}

export function getPeriodPayments(data: Row[]) {
  if (!data || data.length === 0) {
    throw new Error('Orders not found')
  }

  const playerList: Record<string, number> = { '%': 0 }

  data.forEach((row) => {
    const group = row.group.split(/\s?[\.,]/g)
    group?.forEach((name) => {
      const trimmedName = name.trim()
      if (trimmedName.length > 1) {
        if (typeof playerList[trimmedName] === 'number') {
          playerList[trimmedName] += row.tax
            ? (numParse(row.price) * 0.92) / group.length
            : numParse(row.price) / group.length
        } else {
          playerList[trimmedName] = 0
          playerList[trimmedName] += row.tax
            ? (numParse(row.price) * 0.92) / group.length
            : numParse(row.price) / group.length
        }
      }
    })
    if (row.tax) {
      playerList['%'] += numParse(row.price) * 0.08
    }
  })
  return playerList
}
