/** Canonical completed status stored in transaction objects */
export const TRX_STATUS_COMPLETED = "completed";
export const TRX_STATUS_PENDING = "pending";

export function isTrxCompleted(status: string | undefined | null): boolean {
  if (!status) return false;
  const s = String(status).toLowerCase();
  return (
    status === TRX_STATUS_COMPLETED ||
    s === "completed" ||
    s === "success" ||
    status === "مكتمل"
  );
}

/** Normalize legacy Arabic or API strings to canonical codes */
export function normalizeTrxStatus(status: string | undefined | null): string {
  if (status == null || String(status).trim() === "") return TRX_STATUS_COMPLETED;
  if (isTrxCompleted(status)) return TRX_STATUS_COMPLETED;
  return TRX_STATUS_PENDING;
}
