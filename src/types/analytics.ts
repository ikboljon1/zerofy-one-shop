export interface SalesData {
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalAmount: number;
  returns: number;
}

export interface Period {
  startDate: string;
  endDate: string;
}