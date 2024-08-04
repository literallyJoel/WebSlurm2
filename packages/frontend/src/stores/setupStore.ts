import { Store } from "@tanstack/react-store";
import { CreateInitialObject } from "@webslurm2/shared";

interface ProviderInfo {
  name: string;
  clientId?: string;
  clientSecret?: string;
}
const setupStore = new Store({
  user: {
    name: "",
    email: "",
    password: "",
    organisationName: "",
  } as CreateInitialObject,
  providerInfo: [] as ProviderInfo[],
});

export default setupStore;
