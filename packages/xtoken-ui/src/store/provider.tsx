import { Provider } from "jotai";
import { PropsWithChildren } from "react";
import { store } from "./store";
import { useChain } from "./chain";
import { useTronWallet } from "./tronwallet";

export function StoreProvider({ children }: PropsWithChildren<unknown>) {
  return (
    <Provider store={store}>
      <SetupAtom />
      {children}
    </Provider>
  );
}

function SetupAtom() {
  useTronWallet();
  useChain();
  return null;
}
