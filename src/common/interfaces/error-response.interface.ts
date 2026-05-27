export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  requestId?: string | number | null;
  timestamp: string;
  path: string;
}
