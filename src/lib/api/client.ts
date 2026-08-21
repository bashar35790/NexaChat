import type { ErrorCode, ValidationDetail } from "@/types/api";
import { isSessionDeadCode } from "@/types/api";

/** REST base — includes the /api prefix (health/socket live at host root instead). */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://frontend-task-chatapp.onrender.com/api";

const DEFAULT_TIMEOUT_MS = 15_000;

/** Synthetic codes for failures that never reached the API's error envelope. */
export type ClientErrorCode =
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "MALFORMED_RESPONSE";

export class ApiError extends Error {
  /** HTTP status, or 0 for transport-level failures (offline/timeout). */
  readonly status: number;
  readonly code: ErrorCode | ClientErrorCode;
  readonly details?: ValidationDetail[];

  constructor(
    message: string,
    status: number,
    code: ErrorCode | ClientErrorCode,
    details?: ValidationDetail[],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** True for any 4xx — used by the QueryClient to skip retries. */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Session-death union: {400 NO_TOKEN, 401 INVALID_TOKEN}. Missing-token is
   * HTTP 400 on this API, so status checks alone are insufficient (ISSUES.md #2).
   */
  get isSessionDead(): boolean {
    return isSessionDeadCode(this.code as ErrorCode);
  }
}

/* --------------------------- Auth wiring hooks ------------------------------ */
/*
 * The client stays decoupled from the Zustand auth store (Phase 4): the app
 * registers a token getter once at boot, and a force-logout callback that runs
 * exactly once per incident even if dozens of concurrent requests fail.
 */

type TokenProvider = () => string | null;

let getToken: TokenProvider = () => null;
let forceLogoutHandler: (() => void | Promise<void>) | null = null;
let inflightLogout: Promise<void> | null = null;

export function setTokenProvider(provider: TokenProvider): void {
  getToken = provider;
}

export function setForceLogoutHandler(handler: () => void | Promise<void>): void {
  forceLogoutHandler = handler;
}

/**
 * Single-flight guard: the first token-failure triggers logout; every other
 * failing request during that run coalesces into it. Re-arms only after the
 * previous run settles, so a stale-token loop can never cascade.
 */
function handleSessionDead(): void {
  if (!forceLogoutHandler || inflightLogout) return;
  inflightLogout = Promise.resolve()
    .then(forceLogoutHandler)
    .catch((error) => {
      console.error("[api] force-logout handler failed", error);
    })
    .finally(() => {
      inflightLogout = null;
    });
}

/* --------------------------------- Requests --------------------------------- */

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** Undefined values are skipped; numbers/booleans are stringified. */
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Set false for calls that must never attach credentials (login). */
  auth?: boolean;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  let url = `${API_BASE_URL}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params.set(key, String(value));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }
  return url;
}

async function parseBody(response: Response): Promise<unknown> {
  // The API can answer 200 with a literally empty/null body (silent-failure
  // send — ISSUES.md #9), so absence of JSON must not throw here.
  const text = await response.text();
  if (!text || text === "null") return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError(
      "Server returned malformed JSON",
      response.status,
      "MALFORMED_RESPONSE",
    );
  }
}

async function toApiError(response: Response, data: unknown): Promise<ApiError> {
  const envelope = data as { error?: unknown } | null;
  const error = envelope?.error;

  // Shape A — structured envelope {error: {code, message, details?}}.
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    const shaped = error as {
      code: ErrorCode | ClientErrorCode;
      message: string;
      details?: ValidationDetail[];
    };
    return new ApiError(shaped.message, response.status, shaped.code, shaped.details);
  }

  // Shape B — bare-string {error: "..."} (observed on group-permission 403s);
  // the server text is the clearest thing to surface, so keep it verbatim.
  if (typeof error === "string" && error) {
    return new ApiError(error, response.status, "SERVER_ERROR");
  }

  return new ApiError(
    (response.statusText || `Request failed with ${response.status}`).trim(),
    response.status,
    "SERVER_ERROR",
  );
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    query,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    auth = true,
  } = options;

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const onExternalAbort = () => controller.abort();
  signal?.addEventListener("abort", onExternalAbort);

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (timedOut) {
      throw new ApiError("Request timed out", 0, "TIMEOUT");
    }
    if (signal?.aborted) {
      throw new ApiError("Request aborted", 0, "NETWORK_ERROR");
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network request failed",
      0,
      "NETWORK_ERROR",
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onExternalAbort);
  }

  const data = await parseBody(response);

  if (!response.ok) {
    const apiError = await toApiError(response, data);
    if (apiError.isSessionDead) handleSessionDead();
    throw apiError;
  }

  return data as T;
}
