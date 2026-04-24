export interface SignUpResult {
  error: string | null;
  needsVerification: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organisation?: string;
  phone?: string;
}
