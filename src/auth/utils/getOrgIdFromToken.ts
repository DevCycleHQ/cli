import { getTokenPayload } from "./getTokenPayload";

export const getOrgIdFromToken = (token: string): string | undefined => {
  const payload = getTokenPayload(token);
  return payload?.org_id || payload?.["https://devcycle.com/org_id"];
};
