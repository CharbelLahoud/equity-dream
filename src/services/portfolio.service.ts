import { api } from './api';

export interface PortfolioHolding {
  stockId: string;
  ticker: string;
  companyName: string;
  sector: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  profitLoss: number;
  profitLossPct: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPct: number;
  totalPositions: number;
}

export async function getPortfolio(): Promise<PortfolioHolding[]> {
  const response = await api.get<PortfolioHolding[]>('/portfolio');

  return Array.isArray(response.data) ? response.data : [];
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const response = await api.get<PortfolioSummary>('/portfolio/summary');

  return response.data;
}