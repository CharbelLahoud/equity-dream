import { api } from './api';
import { getMyProfile } from './members.service';

export type OrderType = 'BUY' | 'SELL';

export interface Order {
  _id: string;
  stockId: string;
  ticker: string;
  companyName?: string;
  type: OrderType;
  shares: number;
  pricePerShare: number;
  totalAmount: number;
  status: string;
  createdAt?: string;
}

export interface PlaceOrderData {
  stockId: string;
  shares: number;
}

/*
 * Confirmed from the real CreateOrderDto:
 *   memberId: string (Mongo id, required)
 *   stockId: string (Mongo id, required)
 *   shares: number (positive, required)
 *
 * memberId is not cached anywhere we can rely on, so we fetch the
 * logged-in member's profile fresh via the existing getMyProfile()
 * (GET /members/me, confirmed to return the Member object directly,
 * unwrapped) right before placing the order.
 */

async function getCurrentMemberId(): Promise<string> {
  const member = await getMyProfile();
  const memberId = (member as { _id?: string; id?: string })._id
    ?? (member as { _id?: string; id?: string }).id;

  if (!memberId) {
    throw new Error(
      "Could not find an id field (_id or id) on the Member object " +
        "returned by GET /members/me. Check the Member type in " +
        "@/types/member and adjust getCurrentMemberId() in " +
        "orders.service.ts to use the correct field name.",
    );
  }

  return memberId;
}

/*
 * The exact shape of a single order coming back from GET /orders is
 * NOT confirmed yet (we only have the request DTO, not the response).
 * This normalizer is defensive: it tries several plausible field
 * names so the page still renders sensibly if the real names differ
 * slightly, rather than crashing or showing blank cells.
 *
 * Once you've placed a real order, check the Network tab response for
 * GET /orders and tell me the exact field names — I'll tighten this
 * up to match exactly instead of guessing across several options.
 */
function normalizeOrder(raw: Record<string, any>): Order {
  const stockRef =
    (raw.stock as Record<string, any> | undefined) ??
    (typeof raw.stockId === 'object'
      ? (raw.stockId as Record<string, any>)
      : undefined);

  const stockId =
    typeof raw.stockId === 'string'
      ? raw.stockId
      : stockRef?._id ?? '';

  const shares = Number(
    raw.shares ?? raw.quantity ?? raw.numShares ?? 0,
  );

  const pricePerShare = Number(
    raw.pricePerShare ??
      raw.price ??
      raw.executionPrice ??
      stockRef?.currentPrice ??
      0,
  );

  const totalAmount = Number(
    raw.totalAmount ??
      raw.total ??
      raw.amount ??
      shares * pricePerShare,
  );

  const type = String(
    raw.type ?? raw.orderType ?? '',
  ).toUpperCase() as OrderType;

  const status = String(
    raw.status ?? 'COMPLETED',
  ).toUpperCase();

  return {
    _id: raw._id ?? raw.id ?? '',
    stockId,
    ticker:
      raw.ticker ??
      stockRef?.ticker ??
      raw.symbol ??
      stockId ??
      'Unknown',
    companyName:
      raw.companyName ?? stockRef?.companyName,
    type,
    shares,
    pricePerShare,
    totalAmount,
    status,
    createdAt: raw.createdAt,
  };
}

function extractOrdersArray(
  responseData: unknown,
): Record<string, any>[] {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  const body = responseData as
    | { data?: unknown }
    | null
    | undefined;

  if (body && Array.isArray(body.data)) {
    return body.data as Record<string, any>[];
  }

  return [];
}

export async function buyStock(
  data: PlaceOrderData,
) {
  const memberId = await getCurrentMemberId();

  const response =
    await api.post<Record<string, any>>(
      '/orders/buy',
      {
        memberId,
        stockId: data.stockId,
        shares: data.shares,
      },
    );

  return response.data;
}

export async function sellStock(
  data: PlaceOrderData,
) {
  const memberId = await getCurrentMemberId();

  const response =
    await api.post<Record<string, any>>(
      '/orders/sell',
      {
        memberId,
        stockId: data.stockId,
        shares: data.shares,
      },
    );

  return response.data;
}

export async function getOrders(): Promise<Order[]> {
  const response =
    await api.get<unknown>('/orders');

  return extractOrdersArray(response.data).map(
    normalizeOrder,
  );
}

export async function getOrderById(
  orderId: string,
): Promise<Order> {
  const response =
    await api.get<Record<string, any>>(
      `/orders/${orderId}`,
    );

  const body = response.data as
    | { data?: Record<string, any> }
    | Record<string, any>;

  const raw =
    'data' in body && body.data
      ? body.data
      : body;

  return normalizeOrder(
    raw as Record<string, any>,
  );
}