import { api } from "@/services/api";
import type { CmsUser } from "@/types/cms-user";

export type CmsUsersResponse = {
  items: CmsUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type SuspendCmsUserResponse = {
  message: string;
  reason: string;
  cmsUser: CmsUser;
};

export type ReinstateCmsUserResponse = {
  message: string;
  cmsUser: CmsUser;
};
export type CmsRole = "ADMINISTRATOR" | "ANALYST" | "SUPPORT_AGENT";

export type CreateCmsUserDto = {
  fullName: string;
  email: string;
  role: CmsRole;
};

export type CreateCmsUserResponse = {
  message: string;
  cmsUser: CmsUser;
};
``
export async function getCmsUsers(): Promise<CmsUsersResponse> {
  const response = await api.get<CmsUsersResponse>("/cms-users");

  return response.data;
}

export async function getCmsUserById(id: string): Promise<CmsUser> {
  const response = await api.get<CmsUser>(`/cms-users/${id}`);

  return response.data;
}

export async function suspendCmsUser(id: string, reason: string): Promise<SuspendCmsUserResponse> {
  const response = await api.patch<SuspendCmsUserResponse>(`/cms-users/${id}/suspend`, { reason });

  return response.data;
}

export async function reinstateCmsUser(
  id: string,
  reason: string,
): Promise<ReinstateCmsUserResponse> {
  const response = await api.patch<ReinstateCmsUserResponse>(`/cms-users/${id}/reinstate`, {
    reason,
  });

  return response.data;
}
export async function createCmsUser(
  dto: CreateCmsUserDto,
): Promise<CreateCmsUserResponse> {
  const response = await api.post<CreateCmsUserResponse>(
    "/cms-users",
    dto,
  );

  return response.data;
}