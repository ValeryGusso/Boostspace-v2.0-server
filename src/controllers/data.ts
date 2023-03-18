import { Request, Response } from 'express'
import { DataResponse } from '../interfaces/data.js'
import { PaymentResponse } from '../interfaces/payment.js'
import { ErrorResponse } from '../interfaces/error.js'
import { TotalResponse } from '../interfaces/total.js'
import {
  calculateSalary,
  calculateTotal,
  getPeriodPayments,
  getAllOrders,
  getAllPlayers,
  getPaymentsList,
  sortOrders,
} from '../services/spreadsheet.js'

export const getData = async (req: Request, res: Response<DataResponse | ErrorResponse>) => {
  try {
    const data = await getAllOrders()

    const {
      query: { from, to },
    } = req

    if (from && typeof from === 'string' && to && typeof to === 'string') {
      const sortedData = sortOrders(data, from, to)
      return res.json({ data: sortedData })
    } else {
      return res.json({ data })
    }
  } catch (err: any) {
    console.log(err)
    return res.status(500).json({ message: err.message })
  }
}

export const getPayment = async (req: Request, res: Response<PaymentResponse | ErrorResponse>) => {
  try {
    const { data, periods } = await getPaymentsList()

    await calculateSalary(data)

    return res.json({ data, periods })
  } catch (err: any) {
    console.log(err)
    return res.status(500).json({ message: err.message })
  }
}

export const getTotal = async (req: Request, res: Response<TotalResponse | ErrorResponse>) => {
  try {
    const sortedList = await getAllPlayers()

    const total = await calculateTotal(sortedList)

    return res.json(total)
  } catch (err: any) {
    console.log(err)
    return res.status(500).json({ message: err.message })
  }
}

export async function calculatePeriod(req: Request, res: Response) {
  try {
    const {
      query: { from, to },
    } = req

    const data = await getAllOrders()

    if (from && typeof from === 'string' && to && typeof to === 'string') {
      const sortedData = sortOrders(data, from, to)
      const playerList = getPeriodPayments(sortedData)
      return res.json({ orders: sortedData, players: playerList, totalOrders: sortedData.length })
    }
    const playerList = getPeriodPayments(data)
    return res.json({ orders: data, players: playerList, totalOrders: data.length })
  } catch (err: any) {
    console.log(err)
    return res.status(500).json({ message: err.message })
  }
}
