import { api } from "./api";

export type NotificationType =
  | "OTP"
  | "WALLET_CREDIT"
  | "TRADE_EXECUTED"
  | "PRICE_ALERT"
  | "CMS_ACCOUNT_PROVISIONING"
  | "GENERAL";

export type NotificationChannel = "EMAIL" | "PUSH";

export interface NotificationItem {
  _id: string;
  memberId?: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: string;
  recipient: string;
  subject: string;
  body: string;
  isRead: boolean;
  sentAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockReference {
  _id?: string;
  ticker?: string;
  symbol?: string;
  companyName?: string;
  currentPrice?: number;
}

export interface PriceAlert {
  _id: string;

  stockId: string | StockReference;

  targetPrice: number;

  direction: "ABOVE" | "BELOW";

  isActive: boolean;
  triggeredAt?: string;
  createdAt?: string;
}

export interface CreateNotificationData {
  recipient: string;
  subject: string;
  body: string;
  type?: NotificationType;
  channel?: NotificationChannel;
}

export interface CreatePriceAlertData {
  stockId: string;
  targetPrice: number;

  direction: "ABOVE" | "BELOW";
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const response = await api.get<NotificationItem[]>("/notifications");

  return Array.isArray(response.data) ? response.data : [];
}

export async function createNotification(data: CreateNotificationData) {
  const response = await api.post("/notifications", data);

  return response.data;
}

export async function markAllNotificationsRead() {
  const response = await api.patch("/notifications/mark-all-read");

  return response.data;
}

export async function getPriceAlerts(): Promise<PriceAlert[]> {
  const response = await api.get<PriceAlert[]>("/notifications/price-alerts");

  return Array.isArray(response.data) ? response.data : [];
}

export async function createPriceAlert(data: CreatePriceAlertData) {
  const response = await api.post("/notifications/price-alerts", data);

  return response.data;
}

export async function updatePriceAlertStatus(data: { alertId: string; isActive: boolean }) {
  const response = await api.patch("/notifications/price-alerts/status", data);

  return response.data;
}

export async function getStocksForAlerts() {
  const response = await api.get<
    | StockReference[]
    | {
        data?: StockReference[];
        items?: StockReference[];
      }
  >("/stocks");

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data.data)) {
    return response.data.data;
  }

  if (Array.isArray(response.data.items)) {
    return response.data.items;
  }

  return [];
}
