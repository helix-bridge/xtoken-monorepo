import { useContext } from "react";
import { WalletContext } from "../providers/wallet-provider";

export const useWallet = () => useContext(WalletContext);
