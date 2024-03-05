import { axiosClient } from "./apiClient";

export type OrganizationMember = {
  user_id?: string | undefined;
  picture?: string | undefined;
  name?: string | undefined;
  email?: string | undefined;
};

export const fetchOrganizationMembers = async (
  token: string,
): Promise<OrganizationMember[]> => {
  const response = await axiosClient.get("/v1/organizations/current/members", {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  });

  return response.data;
};
