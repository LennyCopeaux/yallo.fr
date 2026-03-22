import { describe, it, expect } from "vitest";
import {
  buildVapiToolCallsMessageFromBody,
  collectToolCallsFromVapiMessage,
  vapiMessageHasToolCalls,
  webhookBodyHasToolCallsPayload,
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

  it("unionne toolCallList et toolCalls par id distinct", () => {
    const calls = collectToolCallsFromVapiMessage({
      toolCallList: [{ id: "1", name: "submit_order", parameters: { a: 1 } }],
      toolCalls: [{ id: "2", function: { name: "other" } }],
    });
    expect(calls).toHaveLength(2);
    const byId = new Map(calls.map((c) => [c.id, c]));
    expect(byId.get("1")?.name).toBe("submit_order");
    expect(byId.get("2")?.name).toBe("other");
  });

  it("fusionne même id quand toolCallList n’a pas de name mais toolCalls a function.name", () => {
    const calls = collectToolCallsFromVapiMessage({
      toolCallList: [{ id: "call_SQop", name: "" }],
      toolCalls: [
        {
          id: "call_SQop",
          type: "function",
          function: {
            name: "submit_order",
            arguments: '{"items":[]}',
          },
        },
      ],
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.name).toBe("submit_order");
    expect(calls[0]?.arguments).toBe('{"items":[]}');
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

describe("buildVapiToolCallsMessageFromBody", () => {
  it("utilise toolCalls à la racine si absent sous message", () => {
    const msg = buildVapiToolCallsMessageFromBody({
      message: {},
      toolCalls: [{ id: "root", function: { name: "submit_order", arguments: "{}" } }],
    });
    expect(msg.toolCalls).toHaveLength(1);
    expect(msg.toolCalls?.[0]?.id).toBe("root");
  });

  it("webhookBodyHasToolCallsPayload true avec toolCalls racine seulement", () => {
    expect(
      webhookBodyHasToolCallsPayload({
        message: {},
        toolCalls: [{ id: "x", function: { name: "submit_order" } }],
      })
    ).toBe(true);
  });
});
