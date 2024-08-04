import { Store } from "@tanstack/react-store";
import { TokenData } from "@webslurm2/shared";

const appStore = new Store({
  tokenData: null as TokenData | null,
});

export default appStore;
