interface SetupComplete {
  isSetup: boolean;
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
