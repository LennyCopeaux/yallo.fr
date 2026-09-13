import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useNewOrderAlert } from "@/components/orders/use-new-order-alert";

const playOrderChime = vi.fn(() => true);

vi.mock("@/lib/order-chime", () => ({
  playOrderChime: () => playOrderChime(),
  unlockOrderChime: () => Promise.resolve(true),
}));

const order = (id: string, status = "NEW") => ({ id, status });

/** Laisse se résoudre la promesse de déblocage audio déclenchée au montage. */
async function flushMountEffects(): Promise<void> {
  await act(async () => {});
}

describe("useNewOrderAlert", () => {
  beforeEach(() => {
    playOrderChime.mockClear();
    globalThis.localStorage?.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("stays silent for orders already present when the screen opens", async () => {
    const { result } = renderHook(() => useNewOrderAlert([order("a"), order("b")]));
    await flushMountEffects();

    expect(result.current.unseenCount).toBe(0);
    expect(playOrderChime).not.toHaveBeenCalled();
  });

  it("counts and rings when a new order arrives", async () => {
    const { result, rerender } = renderHook(
      ({ orders }) => useNewOrderAlert(orders),
      { initialProps: { orders: [order("a")] } }
    );
    await flushMountEffects();

    rerender({ orders: [order("b"), order("a")] });

    expect(result.current.unseenCount).toBe(1);
    expect(playOrderChime).toHaveBeenCalledTimes(1);
  });

  it("accumulates several arrivals between two acknowledgements", async () => {
    const { result, rerender } = renderHook(
      ({ orders }) => useNewOrderAlert(orders),
      { initialProps: { orders: [order("a")] } }
    );
    await flushMountEffects();

    rerender({ orders: [order("b"), order("a")] });
    rerender({ orders: [order("c"), order("d"), order("b"), order("a")] });

    expect(result.current.unseenCount).toBe(3);
  });

  it("ignores orders that are no longer NEW", async () => {
    const { result, rerender } = renderHook(
      ({ orders }) => useNewOrderAlert(orders),
      { initialProps: { orders: [order("a")] } }
    );
    await flushMountEffects();

    rerender({ orders: [order("b", "PREPARING"), order("a")] });

    expect(result.current.unseenCount).toBe(0);
    expect(playOrderChime).not.toHaveBeenCalled();
  });

  it("does not ring twice for the same order", async () => {
    const { result, rerender } = renderHook(
      ({ orders }) => useNewOrderAlert(orders),
      { initialProps: { orders: [order("a")] } }
    );
    await flushMountEffects();

    rerender({ orders: [order("b"), order("a")] });
    rerender({ orders: [order("b"), order("a")] });

    expect(result.current.unseenCount).toBe(1);
    expect(playOrderChime).toHaveBeenCalledTimes(1);
  });

  it("resets the counter once the kitchen acknowledges", async () => {
    const { result, rerender } = renderHook(
      ({ orders }) => useNewOrderAlert(orders),
      { initialProps: { orders: [order("a")] } }
    );
    await flushMountEffects();

    rerender({ orders: [order("b"), order("a")] });
    expect(result.current.unseenCount).toBe(1);

    act(() => result.current.acknowledge());

    expect(result.current.unseenCount).toBe(0);
  });

  it("stops ringing when the sound is muted", async () => {
    const { result, rerender } = renderHook(
      ({ orders }) => useNewOrderAlert(orders),
      { initialProps: { orders: [order("a")] } }
    );
    await flushMountEffects();

    act(() => result.current.toggleSound());
    expect(result.current.soundEnabled).toBe(false);

    rerender({ orders: [order("b"), order("a")] });

    expect(result.current.unseenCount).toBe(1);
    expect(playOrderChime).not.toHaveBeenCalled();
  });
});
