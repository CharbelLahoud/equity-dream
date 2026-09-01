export type Member = {
  _id: string;
  fullName: string;
  email: string;
  nationalId: string;
  dateOfBirth: string;
  isEmailVerified: boolean;
  status: string;
  identityVerificationStatus: string;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  identityReviewedAt?: string;
  identityReviewedBy?: string;
  createdAt: string;
  updatedAt: string;
};
