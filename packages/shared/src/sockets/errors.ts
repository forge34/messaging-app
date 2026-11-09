import z from "zod";

export const SOCKET_ERROR_CODES = [
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "INTERNAL",
  "TIMEOUT",
  "DISCONNECTED",
] as const;

export const SocketErrorCodeSchema = z.enum(SOCKET_ERROR_CODES);

export type SocketErrorCode = z.infer<typeof SocketErrorCodeSchema>;

export const SocketErrorPayloadSchema = z.object({
  code: SocketErrorCodeSchema,
  message: z.string(),
  event: z.string().optional(),
  retryable: z.boolean(),
  status: z.number().int().optional(),
  details: z.unknown().optional(),
});

export type SocketErrorPayload = z.infer<typeof SocketErrorPayloadSchema>;

export type SocketSuccess<T = void> = {
  ok: true;
  data: T;
};

export type SocketFailure = {
  ok: false;
  error: SocketErrorPayload;
};

export type SocketResult<T = void> = SocketSuccess<T> | SocketFailure;

export type SocketAck<T = void> = (result: SocketResult<T>) => void;
