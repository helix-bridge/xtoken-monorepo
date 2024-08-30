import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAtomValue } from "jotai";
import { createContext, PropsWithChildren, useCallback, useMemo } from "react";
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";
import { tronWalletAdapter, tronWalletAddressAtom, tronWalletChainIdAtom } from "../store/tronwallet";
import { ChainConfig } from "../types";
import { isTronChain } from "../utils";
import { Address, toHex } from "viem";
import { selectedSourceChainAtom } from "../store/chain";

interface WalletCtx {
  addressForSelectedSourceChain: Address | undefined;
  needConnectWallet: (chain: ChainConfig) => boolean;
  needSwitchChain: (target: ChainConfig) => boolean;
  connectWallet: (chain: ChainConfig) => void;
  switchChain: (target: ChainConfig) => void;
  disconnectWallet: () => void;
  getAddressForChain: (chain: ChainConfig) => Address | undefined;
}

export const WalletContext = createContext({} as WalletCtx);

export default function WalletProvider({ children }: PropsWithChildren<unknown>) {
  // EVM
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchNetwork } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();

  // Tron
  const tronWalletChainId = useAtomValue(tronWalletChainIdAtom);
  const tronWalletAddress = useAtomValue(tronWalletAddressAtom);

  const selectedSourceChain = useAtomValue(selectedSourceChainAtom);
  const addressForSelectedSourceChain = useMemo(() => {
    if (selectedSourceChain) {
      return isTronChain(selectedSourceChain) ? tronWalletAddress : address;
    }
    return undefined;
  }, [address, tronWalletAddress, selectedSourceChain]);

  const needConnectWallet = useCallback(
    (chain: ChainConfig) => {
      if (isTronChain(chain)) {
        return !tronWalletAddress;
      } else {
        return !address;
      }
    },
    [address, tronWalletAddress],
  );

  const needSwitchChain = useCallback(
    (target: ChainConfig) => {
      if (isTronChain(target)) {
        return tronWalletChainId !== target.id;
      } else {
        return chain?.id !== target.id;
      }
    },
    [chain?.id, tronWalletChainId],
  );

  const connectWallet = useCallback(
    (chain: ChainConfig) => {
      if (isTronChain(chain)) {
        tronWalletAdapter.connect();
      } else {
        openConnectModal?.();
      }
    },
    [openConnectModal],
  );

  const switchChain = useCallback(
    (target: ChainConfig) => {
      if (isTronChain(target)) {
        tronWalletAdapter.switchChain(toHex(target.id));
      } else {
        switchNetwork?.(target.id);
      }
    },
    [switchNetwork],
  );

  const disconnectWallet = useCallback(() => {
    disconnect();
    tronWalletAdapter.disconnect();
  }, [disconnect]);

  const getAddressForChain = useCallback(
    (chain: ChainConfig) => (isTronChain(chain) ? tronWalletAddress : address),
    [address, tronWalletAddress],
  );

  return (
    <WalletContext.Provider
      value={{
        addressForSelectedSourceChain,
        disconnectWallet,
        switchChain,
        connectWallet,
        needSwitchChain,
        needConnectWallet,
        getAddressForChain,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
