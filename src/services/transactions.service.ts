import { api } from './api';

export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'BUY'
  | 'SELL'
  | 'MANUAL_ADJUSTMENT';

interface PopulatedStock {
  _id: string;
  ticker: string;
  companyName: string;
}

interface PopulatedOrder {
  _id: string;
  shares: number;
  pricePerShare: number;
  totalValue: number;
}

export interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  description?: string;
  createdAt?: string;
  // Populated by the backend when present; null/undefined for
  // transaction types that aren't tied to a stock trade
  // (DEPOSIT, WITHDRAWAL, MANUAL_ADJUSTMENT).
  stockId?: PopulatedStock | string | null;
  orderId?: PopulatedOrder | string | null;
}

export interface GetTransactionsParams {
  type?: TransactionType;
  days?: number;
}

export async function getTransactions(
  params: GetTransactionsParams = {},
): Promise<Transaction[]> {
  const response = await api.get<Transaction[]>('/transactions', {
    params,
  });

  return Array.isArray(response.data) ? response.data : [];
}

export async function getTransactionById(
  id: string,
): Promise<Transaction> {
  const response = await api.get<Transaction>(`/transactions/${id}`);

  return response.data;
}

// Small helpers since stockId/orderId may or may not be populated
// depending on the transaction type.
export function getStock(
  transaction: Transaction,
): PopulatedStock | null {
  return typeof transaction.stockId === 'object' && transaction.stockId
    ? transaction.stockId
    : null;
}

export function getOrder(
  transaction: Transaction,
): PopulatedOrder | null {
  return typeof transaction.orderId === 'object' && transaction.orderId
    ? transaction.orderId
    : null;
}