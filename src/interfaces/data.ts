export interface DataResponse {
  data: Row[]
}

export interface Row {
  row: number
  date: string
  type: string
  group: string
  number: string
  price: string
  shop: string
  description: string
  currency: string
  tax: boolean
  done: boolean
}
