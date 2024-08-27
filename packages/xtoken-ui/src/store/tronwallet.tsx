import { atom, useSetAtom } from "jotai";
import { useEffect } from "react";
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapter-tronlink";
import { from, Subscription } from "rxjs";
import { Address } from "viem";
import { convertAddressFromTron } from "../utils";

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

const tronWalletChainIdStrAtom = atom<string>(); // e.g., ChainID.Mainnet
export const tronWalletChainIdAtom = atom<number | undefined>((get) => {
  const tronWalletChainIdStr = get(tronWalletChainIdStrAtom);
  if (tronWalletChainIdStr) {
    return Number(tronWalletChainIdStr);
  }
  return undefined;
}); // e.g., Number(ChainID.Mainnet)

export const tronWalletAddrAtom = atom<string>(); // Base58 format
export const tronWalletAddressAtom = atom<Address | undefined>((get) => {
  const tronWalletAddr = get(tronWalletAddrAtom);
  if (tronWalletAddr) {
    return convertAddressFromTron(tronWalletAddr);
  }
  return undefined;
}); // Hex format

export function useTronWallet() {
  const setTronWalletAddr = useSetAtom(tronWalletAddrAtom);
  const setTronWalletChainIdStr = useSetAtom(tronWalletChainIdStrAtom);

  useEffect(() => {
    let sub$$: Subscription | undefined;
    if (adapter.address) {
      sub$$ = from(adapter.network()).subscribe({
        next: (network) => setTronWalletChainIdStr(network.chainId),
        error: console.error,
      });
      setTronWalletAddr(adapter.address);
    } else {
      setTronWalletAddr(undefined);
      setTronWalletChainIdStr(undefined);
    }

    const connectListener = async (address: string | null) => {
      if (address) {
        setTronWalletAddr(address);
        setTronWalletChainIdStr((await adapter.network()).chainId);
      } else {
        setTronWalletAddr(undefined);
        setTronWalletChainIdStr(undefined);
      }
    };
    const disconnectListener = () => setTronWalletAddr(undefined);
    const accountsChangedListener = (address: string | null) => {
      if (address) {
        setTronWalletAddr(address);
      } else {
        setTronWalletAddr(undefined);
      }
    };
    const chainChangedListener = (chainInfo: unknown) => setTronWalletChainIdStr((chainInfo as ChainInfo).chainId);
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
  }, [setTronWalletChainIdStr, setTronWalletAddr]);

  return null;
}
