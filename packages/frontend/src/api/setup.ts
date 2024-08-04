import { CreateInitialObject } from "@webslurm2/shared";

interface SetupComplete {
  isSetup: boolean;
}

interface createInitialResponse {
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
}

export async function isSetupComplete(): Promise<SetupComplete> {
  const response = await fetch("/api/setup/setupcomplete");
  if (!response.ok) {
    return Promise.reject("Could not fetch setup status");
  }
  return await response.json();
}

export async function markSetupComplete(): Promise<void> {
  const response = await fetch("/api/setup/setupcomplete", {
    method: "POST",
  });

  if (!response.ok) {
    return Promise.reject("Could not mark setup complete");
  }
}

export async function createInitial(
  user: CreateInitialObject
): Promise<createInitialResponse> {
  const response = await fetch("/api/setup/initial", {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log(response.ok);
  if (!response.ok) {
    return Promise.reject("Failed to create initial user");
  }

  return await response.json();
}
