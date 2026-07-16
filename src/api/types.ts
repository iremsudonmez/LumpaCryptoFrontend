// auth shapes -> match elif's live swagger
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  username: string;
  walletBalance: number;
  expiresAt: string;
}

// standard backend error body
export interface ApiErrorBody {
  message: string;
  code: string;
  timestamp: string;
}