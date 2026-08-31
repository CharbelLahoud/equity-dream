export type CmsUser = {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  isTemporaryPassword: boolean;
  temporaryPasswordExpiresAt?: string;
  passwordChangedAt?: string;
  createdBy?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
};
