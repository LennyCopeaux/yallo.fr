import { describe, it, expect } from "vitest";
import {
  collectToolCallsFromVapiMessage,
  vapiMessageHasToolCalls,
} from "@/lib/services/vapi-tool-call-payload";

describe("collectToolCallsFromVapiMessage", () => {
  it("maps OpenAI-style toolCalls (function.name + arguments string)", () => {
    const calls = collectToolCallsFromVapiMessage({
      toolCalls: [
        {
          id: "call_abc",
          type: "function",
          function: {
            name: "submit_order",
            arguments: JSON.stringify({
              customer_name: "Lenny",
              items: [{ product_name: "REGINA", quantity: 1, unit_price: 12.5 }],
            }),
          },
        },
      ],
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.id).toBe("call_abc");
    expect(calls[0]?.name).toBe("submit_order");
    expect(typeof calls[0]?.arguments).toBe("string");
  });

  it("prefers toolCallList when present", () => {
    const calls = collectToolCallsFromVapiMessage({
      toolCallList: [{ id: "1", name: "submit_order", parameters: { a: 1 } }],
      toolCalls: [{ id: "2", function: { name: "other" } }],
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.id).toBe("1");
  });

  it("uses toolWithToolCallList when toolCallList empty", () => {
    const calls = collectToolCallsFromVapiMessage({
      toolWithToolCallList: [
        {
          name: "submit_order",
          toolCall: { id: "x", arguments: "{}" },
        },
      ],
    });
    expect(calls[0]?.name).toBe("submit_order");
    expect(calls[0]?.id).toBe("x");
  });
});

describe("vapiMessageHasToolCalls", () => {
  it("returns true for OpenAI toolCalls only", () => {
    expect(
      vapiMessageHasToolCalls({
        toolCalls: [{ id: "c", function: { name: "submit_order" } }],
      })
    ).toBe(true);
  });
});
