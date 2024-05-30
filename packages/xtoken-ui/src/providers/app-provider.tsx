import { useBalanceAll } from "../hooks";
import { ChainConfig, HistoryDetailsResData, Token } from "../types";
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useState } from "react";
import { Hash } from "viem";

interface HistoryDetails {
  data?: HistoryDetailsResData["historyRecordByTxHash"];
  hash?: Hash;
}

interface AppCtx {
  recordsSearch: string;
  isHistoryOpen: boolean;
  loadingBalanceAll: boolean;
  historyDetails: HistoryDetails | null | undefined;
  balanceAll: { chain: ChainConfig; token: Token; balance: bigint }[];

  updateBalanceAll: () => void;
  setRecordsSearch: Dispatch<SetStateAction<string>>;
  setIsHistoryOpen: Dispatch<SetStateAction<boolean>>;
  setHistoryDetails: Dispatch<SetStateAction<HistoryDetails | null | undefined>>;
}

export const AppContext = createContext({} as AppCtx);

export default function AppProvider({ children }: PropsWithChildren<unknown>) {
  const [historyDetails, setHistoryDetails] = useState<HistoryDetails | null>();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [recordsSearch, setRecordsSearch] = useState("");

  const { balanceAll, loadingBalanceAll, updateBalanceAll } = useBalanceAll();

  return (
    <AppContext.Provider
      value={{
        balanceAll,
        recordsSearch,
        isHistoryOpen,
        historyDetails,
        loadingBalanceAll,

        updateBalanceAll,
        setRecordsSearch,
        setIsHistoryOpen,
        setHistoryDetails,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
