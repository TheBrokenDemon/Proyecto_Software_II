export function registerUser(userData: {
  full_name: string;
  email: string;
  password: string;
  role?: string;
  age?: number;
  gender?: string;
}): Promise<{
  token: string;
  user?: {
    id?: number;
    full_name?: string;
    email?: string;
    role?: string;
  };
  message?: string;
}>;

export function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<{
  token: string;
  user?: {
    id?: number;
    full_name?: string;
    email?: string;
    role?: string;
  };
  message?: string;
}>;

export function getUserProfile(): Promise<any>;

export function updateUserProfile(profileData: {
  full_name?: string;
  age?: number;
  gender?: string;
}): Promise<any>;

export function logoutUser(): void;

export function getToken(): string | null;
