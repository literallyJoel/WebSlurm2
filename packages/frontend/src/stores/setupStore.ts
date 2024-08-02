import { Store } from "@tanstack/react-store";
import { CreateUserObject } from "@webslurm2/shared";

interface ProviderInfo {
  name: string;
  clientId: string;
  clientSecret: string;
}
const setupStore = new Store({
  user: {
    name: "",
    email: "",
    password: "",
    organisationName: "",
  } as Omit<CreateUserObject, "role" | "organisationRole" | "organisationId">,
  providerInfo: [] as ProviderInfo[],
});

export default setupStore;
