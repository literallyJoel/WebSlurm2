import {
  authServiceUrl,
  CreateInitialObject,
  CreateUserObject,
  TokenData,
} from "@webslurm2/shared";
interface CreateInitialResponse {
  token: string;
  result: {
    user: [
      {
        id: string;
        email: string;
      },
    ];
    organisation: [
      {
        id: string;
        name: string;
      },
    ];
    organistionMember: [
      {
        role: "admin" | "user";
      },
    ];
  };
}

export async function createInitial(
  input: CreateInitialObject
): Promise<CreateInitialResponse> {
  const response = await fetch(`${authServiceUrl}/auth/initial`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to create initial user");
  }

  return await response.json();
}

export async function verifyToken(
  token: string
): Promise<TokenData | undefined> {
  const response = await fetch(`${authServiceUrl}/auth/verify`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return undefined;
  }

  return await response.json();
}

export async function login(email: string, password: string) {
  const response = await fetch(`${authServiceUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    return undefined;
  }

  return (await response.json()) as { token: string };
}

export async function register(input: CreateUserObject) {
  const response = await fetch(`${authServiceUrl}/auth/register`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return undefined;
  }
}
