import { api } from "./api";

export interface WalletBalance {
  balance: number;
  lastDepositAt?: string | null;
}

export interface WalletTransaction {
  _id?: string;
  id?: string;
  type: string;
  amount: number;
  status?: string;
  description?: string;
  createdAt?: string;
}

export interface WalletOperationResponse {
  message?: string;
  balance?: number;
  wallet?: WalletBalance;
  transaction?: WalletTransaction;
}

export async function getWalletBalance(): Promise<WalletBalance> {
  const response = await api.get<WalletBalance>("/wallet/balance");

  return response.data;
}

export async function depositMoney(amount: number): Promise<WalletOperationResponse> {
  const response = await api.post<WalletOperationResponse>("/wallet/deposit", { amount });

  return response.data;
}

export async function withdrawMoney(amount: number): Promise<WalletOperationResponse> {
  const response = await api.post<WalletOperationResponse>("/wallet/withdraw", { amount });

  return response.data;
}

export async function getWalletTransactions(): Promise<WalletTransaction[]> {
  const response = await api.get<WalletTransaction[]>("/wallet/transactions");

  return response.data;
}
``;
