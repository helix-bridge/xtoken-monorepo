import { Provider } from "jotai";
import { PropsWithChildren } from "react";
import { store } from "./store";
import { useTronWallet } from "./tronwallet";

export function StoreProvider({ children }: PropsWithChildren<unknown>) {
  useTronWallet();
  return <Provider store={store}>{children}</Provider>;
}
