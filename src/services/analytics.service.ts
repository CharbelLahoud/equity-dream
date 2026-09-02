import { api } from "./api";

export interface MonthlyVolumePoint {
  month: string;
  volume: number;
  trades: number;
}

export interface TradingVolumeResponse {
  totalVolumeAllTime: number;
  totalTradesAllTime: number;

  currentMonthVolume: number;
  previousMonthVolume: number;
  volumeDeltaPct: number;

  currentMonthTrades: number;
  previousMonthTrades: number;
  tradesDeltaPct: number;

  monthly: MonthlyVolumePoint[];
}

export interface TopStock {
  stockId: string;
  ticker: string;
  companyName: string;
  trades: number;
  volume: number;
}

export interface MonthlyMemberPoint {
  month: string;
  count: number;
}

export interface ActiveMembersResponse {
  totalMembers: number;

  currentMonthNew: number;
  previousMonthNew: number;
  deltaPct: number;

  monthlyNewMembers: MonthlyMemberPoint[];
}

export interface SectorAllocationItem {
  sector: string;
  percentage: number;
}

export async function getTradingVolume(): Promise<TradingVolumeResponse> {
  const response = await api.get<TradingVolumeResponse>("/analytics/trading-volume");
  return response.data;
}

export async function getTopStocks(): Promise<TopStock[]> {
  const response = await api.get<TopStock[]>("/analytics/top-stocks");
  return Array.isArray(response.data) ? response.data : [];
}

export async function getActiveMembers(): Promise<ActiveMembersResponse> {
  const response = await api.get<ActiveMembersResponse>("/analytics/active-members");
  return response.data;
}

export async function getSectorAllocation(): Promise<SectorAllocationItem[]> {
  const response = await api.get<SectorAllocationItem[]>("/analytics/sector-allocation");
  return Array.isArray(response.data) ? response.data : [];
}