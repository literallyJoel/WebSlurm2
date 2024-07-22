import { Store } from "@tanstack/react-store";

interface CreateUserObject {
  name?: string;
  email?: string;
  password?: string;
  organisationName?: string;
}

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
  } as CreateUserObject,
  providerInfo: [] as ProviderInfo[],
});

export default setupStore;
