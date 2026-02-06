export interface ApiErrorResponse {
  message?: string;
  messages?: string[];
  fields?: Record<string, string[]>;
  status?: number;
}

export class ApiError extends Error {
  data: ApiErrorResponse;
  constructor(data: ApiErrorResponse) {
    super(data.message ?? "API Error");
    this.data = data;
  }
}
