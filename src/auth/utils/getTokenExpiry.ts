import { getTokenPayload } from "./getTokenPayload";

export const getTokenExpiry = (token: string) => {
  const tokenPayload = getTokenPayload(token);
  return tokenPayload ? tokenPayload.exp * 1000 : undefined;
};
