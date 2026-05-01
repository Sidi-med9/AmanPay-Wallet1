import {
  mockDashboardData,
  mockTransactions,
  mockCategories,
  mockIntermediaries,
  mockReports,
  mockUser,
} from "../data/mockData";
import { isApiConfigured } from "../config/api";
import { DEFAULT_CURRENCY } from "../constants/appDefaults";
import { ApiError, apiRequest, getApiUserId } from "./apiClient";
import { normalizeTrxStatus } from "../utils/trxStatus";

export type AppUser = {
  id: string;
  dbUserId: string;
  referenceId: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  status?: string;
  merchantCategory?: string | null;
  avatar: string;
  language: string;
  theme: string;
};

export type AuthResult = {
  user: AppUser;
  accessToken: string;
  refreshToken: string;
};

type PublicUserDto = {
  id: string;
  dbUserId: number;
  referenceId: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  status?: string;
  merchantCategory?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RecipientLookup = {
  dbUserId: number;
  fullName: string;
  email: string;
  phone: string | null;
  referenceId: string;
  role?: string;
  merchantCategory?: string | null;
};

export type MerchantCategoryOption = {
  code: string;
  displayName: string;
};

type WalletDto = {
  id: number;
  totalBalance: string;
  currency: string;
  user?: { id: number; email: string; fullName: string };
};

type CategoryWalletDto = {
  id: number;
  category: string;
  strictBalance: string;
  dynamicBalance: string;
  currency: string;
};

type CategoryWalletActionResult = {
  movedAmount?: string;
  spentAmount?: string;
};

type TransferDto = {
  id: number;
  totalAmount: string;
  occurredAt: string;
  type: string;
  status: string;
  sender?: { id: number; email: string; fullName: string };
  receiver?: { id: number; email: string; fullName: string };
  envelopes?: Array<{ id: number; type: string; amount: string; status: string; mode?: string }>;
};

type PartnerDto = {
  id: number;
  name: string;
  type: string;
  location: string;
};

type EnvelopeDto = {
  id: number;
  type: string;
  amount: string;
  status: string;
};

function mapPublicUserToAppUser(u: PublicUserDto): AppUser {
  return {
    id: String(u.id),
    dbUserId: String(u.dbUserId),
    referenceId: u.referenceId,
    name: u.fullName,
    email: u.email,
    phone: u.phone ?? "",
    role: u.role,
    status: u.status,
    merchantCategory: u.merchantCategory ?? null,
    avatar: "",
    language: "ar",
    theme: "dark",
  };
}

function mockAuthResult(): AuthResult {
  return {
    user: { ...mockUser },
    accessToken: "mock-access",
    refreshToken: "mock-refresh",
  };
}

function parseNumericUserId(receiver: string): number | null {
  const t = receiver.trim();
  if (!/^\d+$/.test(t)) return null;
  const n = parseInt(t, 10);
  return n >= 1 ? n : null;
}

function emptyDashboard() {
  return {
    appName: "AmanPay",
    balance: 0,
    mainBalance: 0,
    currency: DEFAULT_CURRENCY,
    activeEnvelopes: 0,
    pendingApprovals: 0,
    envelopes: [] as { categoryId: string; balance: number; strictBalance: number; dynamicBalance: number }[],
  };
}

function mapWalletToDashboard(wallet: WalletDto, categoryWallets: CategoryWalletDto[]) {
  const mainBalance = Number.parseFloat(wallet.totalBalance) || 0;
  const envelopes = categoryWallets
    .filter((row) => row.category !== "general")
    .map((row) => {
    const strict = Number.parseFloat(row.strictBalance) || 0;
    const dynamic = Number.parseFloat(row.dynamicBalance) || 0;
    return {
      categoryId: row.category,
      strictBalance: strict,
      dynamicBalance: dynamic,
      balance: strict + dynamic,
    };
  });
  return {
    appName: "AmanPay",
    balance: mainBalance,
    mainBalance,
    currency: DEFAULT_CURRENCY,
    activeEnvelopes: envelopes.length,
    pendingApprovals: 0,
    envelopes,
  };
}

function mapTransferToUi(t: TransferDto, myId: string) {
  const sid = t.sender?.id != null ? String(t.sender.id) : "";
  const rid = t.receiver?.id != null ? String(t.receiver.id) : "";
  const outgoing = sid === myId;
  const peer = outgoing ? t.receiver : t.sender;
  const peerLabel = peer?.fullName || peer?.email || (outgoing ? rid : sid) || "—";
  const typeLower = (t.type || "").toLowerCase();
  const isEnvelope = typeLower === "envelope";
  const isIntl = typeLower.includes("international") || typeLower.includes("intl");
  const envelopeTypes = (t.envelopes ?? []).map((e) => prettifyType(e.type)).slice(0, 3);
  return {
    id: `TRX-${t.id}`,
    type: isIntl ? "international" : "local",
    sender: outgoing ? t.sender?.fullName || t.sender?.email || peerLabel : peerLabel,
    receiver: outgoing ? peerLabel : t.receiver?.fullName || t.receiver?.email || peerLabel,
    amount: Number.parseFloat(t.totalAmount) || 0,
    currency: DEFAULT_CURRENCY,
    date: t.occurredAt,
    status: normalizeTrxStatus(t.status),
    transferMode: isEnvelope ? "envelope" : "normal",
    envelopeSummary: envelopeTypes.length ? envelopeTypes.join(", ") : null,
    outgoing,
  };
}

function mapPartnerToIntermediary(p: PartnerDto) {
  return {
    id: String(p.id),
    name: p.name,
    supportedCountries: p.location ? [p.location] : [],
    fee: p.type || "—",
    speed: "—",
    rate: "—",
    reliability: "—",
    rating: 4.5,
    status: "available",
    tags: [] as string[],
  };
}

function computeReportsFromUi(transactions: ReturnType<typeof mapTransferToUi>[]) {
  let totalSent = 0;
  let totalReceived = 0;
  let localCount = 0;
  let internationalCount = 0;
  for (const t of transactions) {
    if (t.type === "international") internationalCount += 1;
    else localCount += 1;
    totalSent += t.amount;
  }
  return {
    totalSent,
    totalReceived: totalSent * 0.4,
    totalFees: Math.round(totalSent * 0.01),
    transfersCount: transactions.length,
    localCount,
    internationalCount,
    envelopeCount: 0,
  };
}

function colorForType(type: string): string {
  let hash = 0;
  for (let i = 0; i < type.length; i += 1) hash = (hash * 31 + type.charCodeAt(i)) | 0;
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 72%, 52%)`;
}

function prettifyType(type: string): string {
  const clean = (type || "").replace(/[_-]+/g, " ").trim();
  if (!clean) return "General";
  return clean
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

async function ensureWalletForCurrentUser(): Promise<WalletDto | null> {
  const uid = getApiUserId();
  if (!uid) return null;
  const userId = parseInt(uid, 10);
  if (Number.isNaN(userId) || userId < 1) return null;

  const wallets = await apiRequest<WalletDto[]>("/api/resources/wallets");
  let mine = wallets.find((w) => w.user && String(w.user.id) === uid);
  if (!mine) {
    mine = await apiRequest<WalletDto>("/api/resources/wallets", {
      method: "POST",
      body: { userId },
    });
  }
  return mine ?? null;
}

export async function login(credentials: { identifier: string; password: string }): Promise<AuthResult> {
  if (!isApiConfigured()) {
    await new Promise((r) => setTimeout(r, 500));
    return mockAuthResult();
  }
  const json = await apiRequest<{ user: PublicUserDto; accessToken: string; refreshToken: string }>(
    "/api/auth/login",
    { method: "POST", body: { identifier: credentials.identifier.trim(), password: credentials.password } }
  );
  if ((json.user.role || "").toLowerCase() === "admin") {
    throw new ApiError(403, "Admin accounts are not allowed in the mobile app.", "admin_not_allowed_mobile");
  }
  return {
    user: mapPublicUserToAppUser(json.user),
    accessToken: json.accessToken,
    refreshToken: json.refreshToken,
  };
}

export async function register(data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  accountType?: "user" | "merchant";
  merchantCategory?: string;
}): Promise<AuthResult> {
  if (!isApiConfigured()) {
    await new Promise((r) => setTimeout(r, 600));
    return mockAuthResult();
  }
  const json = await apiRequest<{ user: PublicUserDto; accessToken: string; refreshToken: string }>(
    "/api/auth/register",
    {
      method: "POST",
      body: {
        email: data.email,
        password: data.password,
        fullName: data.name,
        accountType: data.accountType ?? "user",
        ...(data.accountType === "merchant" && data.merchantCategory
          ? { merchantCategory: data.merchantCategory.toUpperCase() }
          : {}),
        ...(data.phone?.trim() ? { phone: data.phone.trim() } : {}),
      },
    }
  );
  const user = mapPublicUserToAppUser(json.user);
  if (data.phone) user.phone = data.phone;
  return {
    user,
    accessToken: json.accessToken,
    refreshToken: json.refreshToken,
  };
}

export async function getMerchantCategories(): Promise<MerchantCategoryOption[]> {
  if (!isApiConfigured()) {
    return [
      { code: "AL", displayName: "All Categories" },
      { code: "FO", displayName: "Food" },
      { code: "TR", displayName: "Transportation" },
      { code: "PC", displayName: "Personal Care" },
      { code: "HO", displayName: "Household" },
    ];
  }
  try {
    return await apiRequest<MerchantCategoryOption[]>("/api/auth/merchant-categories");
  } catch {
    return [
      { code: "AL", displayName: "All Categories" },
      { code: "FO", displayName: "Food" },
      { code: "TR", displayName: "Transportation" },
      { code: "PC", displayName: "Personal Care" },
      { code: "HO", displayName: "Household" },
    ];
  }
}

export async function logoutRemote(refreshToken: string): Promise<void> {
  if (!isApiConfigured()) return;
  await apiRequest("/api/auth/logout", {
    method: "POST",
    body: { refreshToken },
  });
}

export async function getProfile(accessToken: string): Promise<AppUser> {
  if (!isApiConfigured()) {
    await new Promise((r) => setTimeout(r, 400));
    return { ...mockUser };
  }
  const u = await apiRequest<PublicUserDto>("/api/users/me", { accessToken });
  return mapPublicUserToAppUser(u);
}

async function withMockDelay<T>(ms: number, fn: () => Promise<T> | T): Promise<T> {
  if (!isApiConfigured()) await new Promise((r) => setTimeout(r, ms));
  return fn();
}

export async function getDashboardData() {
  if (!isApiConfigured()) {
    return withMockDelay(500, () => mockDashboardData);
  }
  const uid = getApiUserId();
  if (!uid) {
    return emptyDashboard();
  }
  try {
    const wallet = await ensureWalletForCurrentUser();
    if (!wallet) return emptyDashboard();
    const categoryWallets = await apiRequest<CategoryWalletDto[]>("/api/resources/category-wallets/me");
    return mapWalletToDashboard(wallet, categoryWallets);
  } catch {
    return emptyDashboard();
  }
}

export async function getTransactions() {
  if (!isApiConfigured()) {
    return withMockDelay(500, () => mockTransactions);
  }
  const uid = getApiUserId();
  if (!uid) return [];
  try {
    const rows = await apiRequest<TransferDto[]>("/api/resources/transfers");
    const mine = rows.filter(
      (t) =>
        (t.sender?.id != null && String(t.sender.id) === uid) ||
        (t.receiver?.id != null && String(t.receiver.id) === uid)
    );
    const sorted = [...mine].sort((a, b) => {
      const ta = new Date(a.occurredAt).getTime();
      const tb = new Date(b.occurredAt).getTime();
      const va = Number.isNaN(ta) ? 0 : ta;
      const vb = Number.isNaN(tb) ? 0 : tb;
      return vb - va;
    });
    return sorted.map((t) => mapTransferToUi(t, uid));
  } catch {
    return [];
  }
}

export async function getCategories() {
  if (!isApiConfigured()) {
    return withMockDelay(400, () => mockCategories);
  }
  const uid = getApiUserId();
  if (!uid) return mockCategories;
  try {
    const rows = await apiRequest<CategoryWalletDto[]>("/api/resources/category-wallets/me");
    if (!rows.length) return mockCategories;
    return rows
      .filter((row) => row.category !== "general")
      .map((row) => {
      const strict = Number.parseFloat(row.strictBalance) || 0;
      const dynamic = Number.parseFloat(row.dynamicBalance) || 0;
      const sum = strict + dynamic;
      return {
      id: row.category,
      name: prettifyType(row.category),
      icon: "layout-grid",
      color: colorForType(row.category),
      description: "",
      amount: sum,
      source: "api",
      };
    });
  } catch {
    return mockCategories;
  }
}

export async function getIntermediaries() {
  if (!isApiConfigured()) {
    return withMockDelay(500, () => mockIntermediaries);
  }
  const uid = getApiUserId();
  if (!uid) return mockIntermediaries;
  try {
    const partners = await apiRequest<PartnerDto[]>("/api/resources/partners");
    if (!partners.length) return mockIntermediaries;
    return partners.map(mapPartnerToIntermediary);
  } catch {
    return mockIntermediaries;
  }
}

export async function getReports() {
  if (!isApiConfigured()) {
    return withMockDelay(500, () => mockReports);
  }
  const uid = getApiUserId();
  if (!uid) {
    return computeReportsFromUi([]);
  }
  try {
    const rows = await apiRequest<TransferDto[]>("/api/resources/transfers");
    const mine = rows.filter(
      (t) =>
        (t.sender?.id != null && String(t.sender.id) === uid) ||
        (t.receiver?.id != null && String(t.receiver.id) === uid)
    );
    return computeReportsFromUi(mine.map((t) => mapTransferToUi(t, uid)));
  } catch {
    return computeReportsFromUi([]);
  }
}

export async function moveFlexibleWalletToMain(categoryId: string, amount: number): Promise<CategoryWalletActionResult> {
  if (!isApiConfigured()) {
    await new Promise((r) => setTimeout(r, 500));
    return { movedAmount: amount.toFixed(2) };
  }
  return apiRequest<CategoryWalletActionResult>("/api/resources/category-wallets/move-dynamic-to-main", {
    method: "POST",
    body: { category: categoryId, amount: amount.toFixed(2) },
  });
}

export async function getMyCategoryWallets(): Promise<CategoryWalletDto[]> {
  if (!isApiConfigured()) {
    return [];
  }
  try {
    return await apiRequest<CategoryWalletDto[]>("/api/resources/category-wallets/me");
  } catch {
    return [];
  }
}

export async function createStrictUnlockRequest(categoryId: string, amount: number): Promise<void> {
  const uid = getApiUserId();
  if (!uid) throw new Error("Unauthorized");
  const userId = Number.parseInt(uid, 10);
  if (!isApiConfigured()) {
    await new Promise((r) => setTimeout(r, 500));
    return;
  }
  await apiRequest("/api/resources/money-requests", {
    method: "POST",
    body: {
      userId,
      amount: amount.toFixed(2),
      category: categoryId,
      status: "pending_unlock",
      requestedAt: new Date().toISOString(),
    },
  });
}

/**
 * Persists a transfer on the server when the recipient is a numeric user id.
 * Otherwise returns ok: false (UI still shows success with a local id).
 */
export async function recordTransferFromSuccess(params: {
  type: string;
  transferMode?: "normal" | "envelope";
  envelopeMode?: "strict" | "flexible";
  envelopes?: Array<{ categoryId: string; amount: string }>;
  receiver: string;
  amount: string;
  receiverDbUserId?: number | null;
  intermediaryId?: string | null;
  paymentSource?: "main" | "category_wallet";
}): Promise<{ id: string; recorded: boolean; receiverName?: string; errorMessage?: string }> {
  if (!isApiConfigured()) {
    return { id: "AMN-" + Math.floor(Math.random() * 1_000_000), recorded: false };
  }
  const uid = getApiUserId();
  if (!uid) {
    return { id: "AMN-" + Math.floor(Math.random() * 1_000_000), recorded: false };
  }
  let receiverId =
    typeof params.receiverDbUserId === "number" && Number.isInteger(params.receiverDbUserId) && params.receiverDbUserId > 0
      ? params.receiverDbUserId
      : null;
  if (receiverId == null) {
    try {
      const resolved = await apiRequest<RecipientLookup>(
        "/api/users/lookup-recipient?identifier=" + encodeURIComponent(params.receiver.trim())
      );
      receiverId = resolved.dbUserId;
    } catch {
      receiverId = parseNumericUserId(params.receiver);
    }
  }
  if (receiverId == null) {
    return {
      id: "AMN-" + Math.floor(Math.random() * 1_000_000),
      recorded: false,
      errorMessage: "Recipient not found by reference or phone.",
    };
  }
  const senderId = parseInt(uid, 10);
  const amountNum = Number.parseFloat(params.amount);
  if (Number.isNaN(amountNum) || amountNum <= 0) {
    return { id: "AMN-" + Math.floor(Math.random() * 1_000_000), recorded: false, errorMessage: "Invalid amount." };
  }
  const typeTag = params.transferMode === "envelope" ? "envelope" : "local";
  try {
    if (params.paymentSource === "category_wallet") {
      if (!receiverId) {
        throw new Error("merchant_not_found");
      }
      const merchantPayment = await apiRequest<{
        transfer: TransferDto;
        spentAmount: string;
        category: string;
        remainingCategoryBalance: string;
      }>("/api/resources/category-wallets/pay-merchant", {
        method: "POST",
        body: {
          merchantId: receiverId,
          amount: amountNum.toFixed(2),
        },
      });
      return {
        id: `TRX-${merchantPayment.transfer.id}`,
        recorded: true,
        receiverName: merchantPayment.transfer.receiver?.fullName || params.receiver,
      };
    }
    const endpoint = typeTag === "envelope" ? "/api/resources/transfers/envelope" : "/api/resources/transfers/simple";
    const created = await apiRequest<TransferDto>(endpoint, {
      method: "POST",
      body: {
        receiverId,
        totalAmount: amountNum.toFixed(2),
        occurredAt: new Date().toISOString(),
        type: typeTag,
        status: "completed",
        ...(typeTag === "envelope"
          ? {
              envelopeMode: params.envelopeMode === "strict" ? "strict" : "dynamic",
              envelopes: (params.envelopes ?? []).map((e) => ({
                type: e.categoryId,
                amount: e.amount,
                mode: params.envelopeMode === "strict" ? "strict" : "dynamic",
              })),
            }
          : {}),
      },
    });
    return {
      id: `TRX-${created.id}`,
      recorded: true,
      receiverName: created.receiver?.fullName || created.receiver?.email || params.receiver,
    };
  } catch {
    return {
      id: "AMN-" + Math.floor(Math.random() * 1_000_000),
      recorded: false,
      errorMessage: "Transfer failed on server. Please try again.",
    };
  }
}

export async function lookupTransferRecipient(identifier: string): Promise<RecipientLookup | null> {
  const q = identifier.trim();
  if (!q || !isApiConfigured()) return null;
  try {
    return await apiRequest<RecipientLookup>("/api/users/lookup-recipient?identifier=" + encodeURIComponent(q));
  } catch {
    return null;
  }
}

export async function verifyTransferPassword(identifier: string, password: string): Promise<boolean> {
  if (!isApiConfigured()) return password.trim().length > 0;
  try {
    await apiRequest<{ accessToken: string; refreshToken: string; user: PublicUserDto }>("/api/auth/login", {
      method: "POST",
      body: { identifier, password },
    });
    return true;
  } catch {
    return false;
  }
}

export async function createLocalTransfer(_payload: unknown) {
  return withMockDelay(600, () =>
    isApiConfigured()
      ? { success: true, transactionId: "TRX-MOCK-LOCAL" }
      : { success: true, transactionId: "TRX-" + Math.floor(Math.random() * 10000) }
  );
}

export async function createInternationalTransfer(_payload: unknown) {
  return withMockDelay(600, () =>
    isApiConfigured()
      ? { success: true, transactionId: "TRX-MOCK-INTL" }
      : { success: true, transactionId: "TRX-" + Math.floor(Math.random() * 10000) }
  );
}
