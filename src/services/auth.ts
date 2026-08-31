import { api } from "@/services/api";

export type RegisterMemberDto = {
  fullName: string;
  email: string;
  nationalId: string;
  dateOfBirth: string;
};

export type VerifyEmailOtpDto = {
  email: string;
  code: string;
};

export type ResendEmailOtpDto = {
  email: string;
};
export type SetPasswordDto = {
  email: string;
  password: string;
  confirmPassword: string;
};
export type CmsLoginDto = {
  email: string;
  password: string;
};

export type CmsLoginResponse = {
  message?: string;
  requiresPasswordChange?: boolean;
  accessToken?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    userType: "CMS";
    role: string;
    status: string;
  };
};
export type ChangeTemporaryPasswordDto = {
  email: string;
  temporaryPassword: string;
  newPassword: string;
  confirmPassword: string;
};
export type ChangeTemporaryPasswordResponse = {
  message: string;
  accessToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    userType: "CMS";
    role: string;
    status: string;
  };
};
export async function registerMember(dto: RegisterMemberDto): Promise<void> {
  await api.post("/auth/register", dto);
}

export async function verifyEmailOtp(dto: VerifyEmailOtpDto): Promise<void> {
  await api.post("/auth/verify-email-otp", dto);
}
export async function resendEmailOtp(dto: ResendEmailOtpDto): Promise<void> {
  await api.post("/auth/resend-email-otp", dto);
}
export async function setMemberPassword(dto: SetPasswordDto): Promise<void> {
  await api.post("/auth/set-password", dto);
}
export async function loginCms(dto: CmsLoginDto): Promise<CmsLoginResponse> {
  const response = await api.post<CmsLoginResponse>("/auth/cms/login", dto);

  return response.data;
}
export async function changeCmsTemporaryPassword(
  dto: ChangeTemporaryPasswordDto,
): Promise<ChangeTemporaryPasswordResponse> {
  const response = await api.post<ChangeTemporaryPasswordResponse>(
    "/auth/cms/change-temporary-password",
    dto,
  );

  return response.data;
}
