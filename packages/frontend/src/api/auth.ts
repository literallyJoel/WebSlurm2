import { TokenData } from "@webslurm2/shared";

export async function verifyToken(token: string): Promise<TokenData> {
  const response = await fetch("/api/auth/verify", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return Promise.reject("Failed to verify token");
  }

  return await response.json();
}
