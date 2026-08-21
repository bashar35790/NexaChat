/**
 * API entity types ,transcribed verbatim from live observations in Phase 1.
 * Source of truth: docs/API.md + docs/probing-notes.md (+ docs/openapi.yaml).
 * Do not "improve" shapes here: quirks like the empty `lastMessage` object or the
 * bare-ids `participants` array on conversation create are intentional encodings
 * of real server behavior (see docs/ISSUES.md).
 */

/** 24-char hex Mongo ObjectId as returned by the server. */
export type ObjectId = string;

export interface User {
  _id: ObjectId;
  name: string;
  phone: string;
  /** Present on login/auth/me payloads; absent from /users/search results. */
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

/** Preview of the newest message embedded in a conversation entity. */
export interface MessagePreview {
  text: string;
  sender: ObjectId;
  createdAt: string;
}

/**
 * The server returns `{}` for conversations with zero messages, so every field
 * is optional at the type level too ,consumers must narrow before rendering.
 */
export type ConversationLastMessage = Partial<MessagePreview>;

interface ConversationBase {
  _id: ObjectId;
  lastMessage?: ConversationLastMessage;
  updatedAt: string;
}

export interface DirectConversation extends ConversationBase {
  type: "direct";
  /** Singular enriched user; no name/admins/createdBy fields on direct chats. */
  participant: User;
}

export interface GroupConversation extends ConversationBase {
  type: "group";
  name: string;
  createdBy: ObjectId;
  admins: ObjectId[];
  participants: User[];
}

export type Conversation = DirectConversation | GroupConversation;

/** POST /api/conversations response ,note: bare id list, NOT enriched users. */
export interface CreatedDirectConversation {
  _id: ObjectId;
  participants: ObjectId[];
  createdAt: string;
}

export interface Message {
  _id: ObjectId;
  /** Field is named `conversation` (not `conversationId`) per observed payloads. */
  conversation: ObjectId;
  /** Bare sender id ,resolve display names via the parent conversation. */
  sender: ObjectId;
  text: string;
  /** ISO-8601 string over REST (WS events use epoch millis ,normalize first). */
  createdAt: string;
}

/**
 * A message as held in client caches: server entity plus optional LOCAL send
 * state used by optimistic sending. `status` is never present on data that
 * came straight from the API.
 */
export interface ClientMessage extends Message {
  status?: "pending" | "failed";
}

/** GET /api/conversations/{id}/messages envelope (newest-first pages). */
export interface MessagePage {
  messages: Message[];
  hasMore: boolean;
}

/* ---------------------------------- Errors --------------------------------- */

export const ERROR_CODES = [
  "VALIDATION_ERROR",
  "NO_TOKEN",
  "INVALID_TOKEN",
  "UNKNOWN_USER",
  "NOT_FOUND",
  "FORBIDDEN",
  "SERVER_ERROR",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/** Missing-token is HTTP 400 NO_TOKEN (not 401) ,both mean "session dead". */
export function isSessionDeadCode(code: ErrorCode): boolean {
  return code === "NO_TOKEN" || code === "INVALID_TOKEN";
}

export interface ValidationDetail {
  path: string;
  message: string;
}

/** Uniform error envelope: { error: { message, code, details? } }. */
export interface ErrorEnvelope {
  error: {
    message: string;
    code: ErrorCode;
    details?: ValidationDetail[];
  };
}

/* ------------------------------ Socket payloads ----------------------------- */

/**
 * Raw `message:new` payload. Differs from REST Message: key `id` instead of
 * `_id`, and numeric epoch-millis `createdAt`. Normalize via lib/api/normalize
 * before entering query caches (Phase 7).
 */
export interface RawSocketMessage {
  id: ObjectId;
  conversation: ObjectId;
  sender: ObjectId;
  text: string;
  createdAt: number;
}

/**
 * `conversation:updated` payload ,a PARTIAL group entity (probed live):
 * REST-style `_id` + enriched participants, but NO lastMessage/updatedAt, so
 * it must be MERGED into the cached conversation rather than replacing it.
 */
export interface ConversationUpdatedPayload {
  _id: ObjectId;
  type: "direct" | "group";
  name?: string;
  createdBy?: ObjectId;
  admins?: ObjectId[];
  participants?: User[];
}
