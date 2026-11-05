import { QueryClient } from "@tanstack/react-query";
import { Routes } from "@chat/shared";
import { beforeEach, describe, expect, test } from "vitest";
import {
  appendMessage,
  markMessagesRead,
  moveConversationToFront,
  prependNewConversation,
  replaceTempMessage,
  updateMessageReactions,
} from "./cache";
import type { ConversationDetail, ConversationListItem, Message } from "./cache";
import type z from "zod";

type DetailResponse = z.infer<typeof Routes.getConversationById.responseSchema>;
type ListResponse = z.infer<
  typeof Routes.getCurrentUserConversations.responseSchema
>;

const qc = new QueryClient();

beforeEach(() => {
  qc.clear();
});

const user = { id: "u1", name: "alice" };

const message: Message = {
  id: "m1",
  clientId: undefined,
  body: "hi",
  status: "PENDING",
  authorId: "u2",
  author: user,
  createdAt: new Date("2026-01-01"),
  isMine: false,
  messageReactions: [],
} as unknown as Message;

const detail = (id: string, messages: Message[]): DetailResponse => ({
  message: "ok",
  status: 200,
  data: {
    id,
    title: null,
    users: [],
    messages,
    lastMessage: messages[messages.length - 1] ?? null,
    lastMessageAt: new Date(0),
    createdAt: new Date(0),
    updatedAt: new Date(0),
    otherUser: user,
  } as unknown as DetailResponse["data"],
});

const listItem = (id: string): ConversationListItem =>
  ({
    id,
    users: [user],
    messages: [message],
    lastMessage: message,
    lastMessageAt: new Date(0),
    createdAt: new Date(0),
    updatedAt: new Date(0),
    title: null,
    otherUser: user,
  }) as unknown as ConversationListItem;

const list = (ids: string[]): ListResponse => ({
  message: "ok",
  status: 200,
  data: ids.map(listItem),
});

beforeEach(() => {
  qc.setQueryData(["conversations", "c1"], detail("c1", []));
  qc.setQueryData(["conversations"], list(["c1"]));
});

describe("moveConversationToFront", () => {
  test("moves conversation to front and updates lastMessage", () => {
    qc.setQueryData(["conversations"], list(["c1", "c2", "c3"]));

    moveConversationToFront("c2", message, new Date("2026-02-02"), qc);

    const data = qc.getQueryData<ListResponse>(["conversations"]);
    expect(data?.data?.map((c) => c.id)).toEqual(["c2", "c1", "c3"]);
    expect(data?.data?.[0]?.lastMessage?.id).toBe("m1");
    expect(data?.data?.[0]?.lastMessageAt).toEqual(new Date("2026-02-02"));
  });

  test("no-ops when target conversation is missing", () => {
    const before = qc.getQueryData(["conversations"]);

    moveConversationToFront("missing", message, undefined, qc);

    expect(qc.getQueryData(["conversations"])).toBe(before);
  });

  test("no-ops when list cache is empty (no fabricated empty list)", () => {
    qc.removeQueries({ queryKey: ["conversations"] });

    moveConversationToFront("c1", message, undefined, qc);

    expect(qc.getQueryData(["conversations"])).toBeUndefined();
  });
});

describe("appendMessage", () => {
  test("appends message to conversation detail", () => {
    appendMessage("c1", message, {}, qc);

    const data = qc.getQueryData<DetailResponse>(["conversations", "c1"]);
    expect(data?.data?.messages).toHaveLength(1);
    expect(data?.data?.messages[0].id).toBe("m1");
  });

  test("dedupe skips already-present id", () => {
    qc.setQueryData(["conversations", "c1"], detail("c1", [message]));

    appendMessage("c1", message, { dedupe: true }, qc);

    const data = qc.getQueryData<DetailResponse>(["conversations", "c1"]);
    expect(data?.data?.messages).toHaveLength(1);
  });

  test("no-ops when detail cache is empty", () => {
    qc.removeQueries({ queryKey: ["conversations", "c1"] });

    appendMessage("c1", message, {}, qc);

    expect(qc.getQueryData(["conversations", "c1"])).toBeUndefined();
  });
});

describe("replaceTempMessage", () => {
  test("replaces temp message by clientId and marks isMine", () => {
    const temp: Message = { ...message, id: "", clientId: "temp-1" };
    qc.setQueryData(["conversations", "c1"], detail("c1", [temp]));

    replaceTempMessage("c1", "temp-1", message, qc);

    const data = qc.getQueryData<DetailResponse>(["conversations", "c1"]);
    expect(data?.data?.messages).toHaveLength(1);
    expect(data?.data?.messages[0].id).toBe("m1");
    expect(data?.data?.messages[0].clientId).toBe("temp-1");
    expect(data?.data?.messages[0].isMine).toBe(true);
  });

  test("leaves messages untouched when no clientId matches", () => {
    qc.setQueryData(["conversations", "c1"], detail("c1", [message]));

    replaceTempMessage("c1", "other-temp", message, qc);

    const data = qc.getQueryData<DetailResponse>(["conversations", "c1"]);
    expect(data?.data?.messages[0].id).toBe("m1");
  });
});

describe("markMessagesRead", () => {
  test("sets READ status only on targeted ids", () => {
    const other = { ...message, id: "m2" };
    qc.setQueryData(["conversations", "c1"], detail("c1", [message, other]));

    markMessagesRead("c1", ["m2"], qc);

    const data = qc.getQueryData<DetailResponse>(["conversations", "c1"]);
    expect(data?.data?.messages[0].status).toBe("PENDING");
    expect(data?.data?.messages[1].status).toBe("READ");
  });
});

describe("updateMessageReactions", () => {
  test("updates reactions only on matching message id", () => {
    const other = { ...message, id: "m2", messageReactions: [] };
    const reacted = { ...message, messageReactions: [] as unknown as never };
    qc.setQueryData(["conversations", "c1"], detail("c1", [message, other]));

    updateMessageReactions("c1", reacted, qc);

    const data = qc.getQueryData<DetailResponse>(["conversations", "c1"]);
    expect(data?.data?.messages[0]).toStrictEqual(reacted);
    expect(data?.data?.messages[1].id).toBe("m2");
  });
});

describe("prependNewConversation", () => {
  test("prepends new conversation with otherUser computed", () => {
    const existing = list(["c1"]);
    qc.setQueryData(["conversations"], existing);

    const conv = {
      ...detail("c9", []).data,
      users: [user, { ...user, id: "u2" }],
    } as unknown as ConversationDetail;

    prependNewConversation(conv, "u1", qc);

    const data = qc.getQueryData<ListResponse>(["conversations"]);
    expect(data?.data?.[0].id).toBe("c9");
    expect(data?.data?.[0].otherUser?.id).toBe("u2");
    expect(data?.data).toHaveLength(2);
  });

  test("no-ops when conversation already exists", () => {
    const conv = detail("c1", []).data as unknown as ConversationDetail;

    prependNewConversation(conv, "u1", qc);

    const data = qc.getQueryData<ListResponse>(["conversations"]);
    expect(data?.data).toHaveLength(1);
  });

  test("no-ops when list cache is empty", () => {
    qc.removeQueries({ queryKey: ["conversations"] });
    const conv = detail("c9", []).data as unknown as ConversationDetail;

    prependNewConversation(conv, "u1", qc);

    expect(qc.getQueryData(["conversations"])).toBeUndefined();
  });
});
