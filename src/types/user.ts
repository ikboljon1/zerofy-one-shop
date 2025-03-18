
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  isVerified?: boolean;
  createdAt?: string;
  phone?: string;
}
