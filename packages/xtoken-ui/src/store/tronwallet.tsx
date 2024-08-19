import { atom, useSetAtom } from "jotai";
import { useEffect } from "react";
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapter-tronlink";
import { from, Subscription } from "rxjs";

export enum TronChainID {
  Mainnet = "0x2b6653dc",
  Shasta = "0x94a9059e",
  Nile = "0xcd8690dc",
}

interface ChainInfo {
  chainId: string;
}

const adapter = new TronLinkAdapter();
export const tronWalletAdapter = adapter;

export const tronWalletAddrAtom = atom("");
export const tronWalletChainAtom = atom(""); // e.g., ChainID.Mainnet

export function useTronWallet() {
  const setTronWalletAddr = useSetAtom(tronWalletAddrAtom);
  const setTronWalletChain = useSetAtom(tronWalletChainAtom);

  useEffect(() => {
    let sub$$: Subscription | undefined;
    if (adapter.address) {
      sub$$ = from(adapter.network()).subscribe({
        next: (network) => setTronWalletChain(network.chainId),
        error: console.error,
      });
    }
    setTronWalletAddr(adapter.address ?? "");

    const connectListener = async (address: string | null) => {
      setTronWalletAddr(address ?? "");
      setTronWalletChain((await adapter.network()).chainId);
    };
    const disconnectListener = () => setTronWalletAddr("");
    const accountsChangedListener = (address: string | null) => setTronWalletAddr(address ?? "");
    const chainChangedListener = (chainInfo: unknown) =>
      setTronWalletChain((chainInfo as ChainInfo | null)?.chainId ?? "");
    const errorListener = console.error;

    adapter.on("connect", connectListener);
    adapter.on("disconnect", disconnectListener);
    adapter.on("accountsChanged", accountsChangedListener);
    adapter.on("chainChanged", chainChangedListener);
    adapter.on("error", errorListener);

    return () => {
      sub$$?.unsubscribe();
      adapter.off("connect", connectListener);
      adapter.off("disconnect", disconnectListener);
      adapter.off("accountsChanged", accountsChangedListener);
      adapter.off("chainChanged", chainChangedListener);
      adapter.off("error", errorListener);
    };
  }, [setTronWalletChain, setTronWalletAddr]);

  return null;
}
