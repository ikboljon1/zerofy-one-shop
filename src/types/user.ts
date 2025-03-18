
export interface User {
  id: string;
  email?: string;
  name?: string;
  role?: 'user' | 'admin';
  apiKey?: string;
  phone?: string;
  verified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
  tariff?: string;
  stores?: string[];
}
