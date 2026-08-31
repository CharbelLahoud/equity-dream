import { api } from './api';

export type StockPriceSource =
  | 'MANUAL'
  | 'TWELVE_DATA';

export type StockPriceStatus =
  | 'MANUAL'
  | 'CURRENT'
  | 'STALE'
  | 'ERROR';

export interface Stock {
  _id: string;
  ticker: string;
  companyName: string;
  sector: string;
  currentPrice: number;
  description: string;
  isListed: boolean;
  priceSource?: StockPriceSource;
  priceStatus?: StockPriceStatus;
  lastPriceUpdateAt?: string;
  priceError?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StocksResponse {
  message: string;
  data: Stock[];
}

interface StockResponse {
  message: string;
  data: Stock;
}

export interface CreateStockData {
  ticker: string;
  companyName: string;
  sector: string;
  currentPrice: number;
  description: string;
}

export type UpdateStockData =
  Partial<CreateStockData>;

export async function getStocks():
  Promise<Stock[]> {
  const response =
    await api.get<StocksResponse>(
      '/stocks',
    );

  return Array.isArray(
    response.data.data,
  )
    ? response.data.data
    : [];
}

export async function getStockById(
  stockId: string,
): Promise<Stock> {
  const response =
    await api.get<StockResponse>(
      `/stocks/${stockId}`,
    );

  return response.data.data;
}

export async function createStock(
  data: CreateStockData,
) {
  const response =
    await api.post<StockResponse>(
      '/stocks',
      data,
    );

  return response.data;
}

export async function updateStock(
  stockId: string,
  data: UpdateStockData,
) {
  const response =
    await api.patch<StockResponse>(
      `/stocks/${stockId}`,
      data,
    );

  return response.data;
}

export async function updateStockPrice(
  stockId: string,
  price: number,
) {
  const response =
    await api.patch<StockResponse>(
      `/stocks/${stockId}/price`,
      {
        price,
      },
    );

  return response.data;
}

export async function delistStock(
  stockId: string,
) {
  const response =
    await api.patch<StockResponse>(
      `/stocks/${stockId}/delist`,
    );

  return response.data;
}

export async function relistStock(
  stockId: string,
) {
  const response =
    await api.patch<StockResponse>(
      `/stocks/${stockId}/relist`,
    );

  return response.data;
}