export interface PaymentResponse {
  data: PaymentsPlayer[]
  periods: string[]
}

export interface PaymentsPlayer {
  name: string
  payments: Payments
  total: Total
  paid: Total
}

export interface Payments {
  [key: string]: Period
}

export interface Period {
  overall: string | null
  paid: string | null
  currency: string
}

export interface Total {
  usd: number
  rub: number
}
