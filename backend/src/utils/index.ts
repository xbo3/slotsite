export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export function successResponse(data: any): ApiResponse {
  return { success: true, data };
}

export function errorResponse(error: string): ApiResponse {
  return { success: false, error };
}
