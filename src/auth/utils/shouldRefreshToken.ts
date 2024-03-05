import { getTokenExpiry } from "./getTokenExpiry";

export const shouldRefreshToken = (token: string): boolean => {
  const tokenExpiry = getTokenExpiry(token);
  if (!tokenExpiry) return true;

  const hoursToExpiry = (tokenExpiry - Date.now()) / 1000 / 60 / 60;
  return hoursToExpiry <= 1;
};
