/**
 * Normalise les arguments renvoyés par Vapi / le LLM pour submit_order
 * (JSON stringifié, camelCase vs snake_case).
 */

export interface VapiSubmitOrderItemInput {
  product_name: string;
  quantity: number;
  unit_price: number;
  options?: string;
}

export interface VapiSubmitOrderPayload {
  customer_name: string;
  customer_phone?: string;
  items: VapiSubmitOrderItemInput[];
  pickup_time?: string;
  notes?: string;
}

function parseParametersObject(raw: unknown): Record<string, unknown> {
  if (raw === null || raw === undefined) {
    return {};
  }
  if (typeof raw === "string") {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return {};
    } catch {
      return {};
    }
  }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function toOptionalString(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  const s = String(value).trim();
  return s.length > 0 ? s : undefined;
}

function toPositiveQuantity(value: unknown): number {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(n) || n < 1) {
    return 1;
  }
  return Math.floor(n);
}

/**
 * Interprète unit_price comme un montant en euros (ex: 8.5) pour le webhook.
 */
function toUnitPriceEuros(value: unknown): number {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value).replace(",", "."));
  if (!Number.isFinite(n) || n < 0) {
    return 0;
  }
  return n;
}

function normalizeItem(raw: unknown): VapiSubmitOrderItemInput | null {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const productName = toOptionalString(o.product_name ?? o.productName);
  if (!productName) {
    return null;
  }
  const quantity = toPositiveQuantity(o.quantity ?? o.qty);
  const unitPrice = toUnitPriceEuros(o.unit_price ?? o.unitPrice ?? o.price);
  const options = toOptionalString(o.options ?? o.option ?? o.modifiers);
  return {
    product_name: productName,
    quantity,
    unit_price: unitPrice,
    ...(options !== undefined ? { options } : {}),
  };
}

/**
 * Transforme les paramètres bruts d'un tool call Vapi en payload exploitable.
 * Retourne null si customer_name ou items valides manquent.
 */
export function normalizeSubmitOrderPayload(raw: unknown): VapiSubmitOrderPayload | null {
  const o = parseParametersObject(raw);
  const customerName = toOptionalString(o.customer_name ?? o.customerName);
  if (!customerName) {
    return null;
  }

  const rawItems = o.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return null;
  }

  const items: VapiSubmitOrderItemInput[] = [];
  for (const row of rawItems) {
    const item = normalizeItem(row);
    if (item) {
      items.push(item);
    }
  }
  if (items.length === 0) {
    return null;
  }

  const customerPhone = toOptionalString(o.customer_phone ?? o.customerPhone ?? o.phone);
  const pickupTime = toOptionalString(o.pickup_time ?? o.pickupTime);
  const notes = toOptionalString(o.notes ?? o.note ?? o.special_instructions);

  return {
    customer_name: customerName,
    items,
    ...(customerPhone !== undefined ? { customer_phone: customerPhone } : {}),
    ...(pickupTime !== undefined ? { pickup_time: pickupTime } : {}),
    ...(notes !== undefined ? { notes } : {}),
  };
}
