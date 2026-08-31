import { api } from "@/services/api";
import type { Member } from "@/types/member";

export type UpdateMemberProfileDto = {
  fullName: string;
};

export type MembersResponse = {
  data: Member[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
export type IdentityReviewStatus = "APPROVED" | "REJECTED";

export type ReviewMemberIdentityDto = {
  status: IdentityReviewStatus;
  rejectionReason?: string;
};
export type SuspendMemberDto = {
  reason: string;
};
export type SuspendMemberVariables = {
  id: string;
  dto: SuspendMemberDto;
};
export type ReinstateMemberDto = {
reason: string;
};
 
export type ReinstateMemberVariables = {
id: string;
dto: ReinstateMemberDto;
};
export type GetMembersParams = {
search?: string;
status?: string;
identityVerificationStatus?: string;
page?: number;
limit?: number;
};
export async function getMyProfile(): Promise<Member> {
  const response = await api.get<Member>("/members/me");

  return response.data;
}

export async function updateMyProfile(dto: UpdateMemberProfileDto): Promise<Member> {
  const response = await api.patch<Member>("/members/me", dto);

  return response.data;
}

export async function getMembers(
  params: GetMembersParams = {},
): Promise<MembersResponse> {
  const response = await api.get<MembersResponse>("/members", {
    params,
  });

  return response.data;
}
export async function getMemberById(id: string): Promise<Member> {
  const response = await api.get<Member>(`/members/${id}`);

  return response.data;
}
export async function reviewMemberIdentity(
  id: string,
  dto: ReviewMemberIdentityDto,
): Promise<Member> {
  const response = await api.patch<Member>(`/members/${id}/identity`, dto);

  return response.data;
}
export async function suspendMember({ id, dto }: SuspendMemberVariables): Promise<Member> {
  const response = await api.patch<Member>(`/members/${id}/suspend`, dto);
  return response.data;
}
export async function reinstateMember({
id,
dto,
}: ReinstateMemberVariables): Promise<Member> {
const response = await api.patch<Member>(
`/members/${id}/reinstate`,
dto,
);
 
return response.data;
}