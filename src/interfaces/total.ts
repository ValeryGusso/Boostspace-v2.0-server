export interface TotalResponse {
  data: TotalsPlayer[]
  total: Total
}

export interface TotalsPlayer {
  name: string
  usd: number
  rub: number
}

export interface Total {
  usd: number
  rub: number
}
