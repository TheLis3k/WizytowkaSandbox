export interface UserResponse {
  id: number;
  email: string;
  role: 'MASTER_USER' | 'SUPER_USER';
  active: boolean;
  emailVerified: boolean;
}
