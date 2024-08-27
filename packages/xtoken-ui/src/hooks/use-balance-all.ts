import { getBalanceEVM, getBalanceTron, getChainConfigs, isTronChain } from "../utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPublicClient, http } from "viem";
import { forkJoin, map, of, merge, mergeAll } from "rxjs";
import { ChainConfig, Token } from "../types";
import { useWallet } from "./use-wallet";

const chains = getChainConfigs().filter((c) => c.network !== "polygon");

interface BalanceAll {
  chain: ChainConfig;
  token: Token;
  balance: bigint;
}

export function useBalanceAll() {
  const [loading, setLoading] = useState(false);
  const { addressForSelectedSourceChain } = useWallet();

  const [balanceAll, setBalanceAll] = useState<BalanceAll[]>([]);
  const balanceAllRef = useRef(balanceAll);

  const updateBalanceAll = useCallback(() => {
    if (addressForSelectedSourceChain) {
      const chainsObs = chains.map((chain) => {
        const publicClient = isTronChain(chain)
          ? undefined
          : createPublicClient({ chain, batch: { multicall: true }, transport: http() });

        const tokensObs = chain.tokens.map((token) =>
          isTronChain(chain)
            ? getBalanceTron(chain, token, addressForSelectedSourceChain)
            : getBalanceEVM(chain, token, addressForSelectedSourceChain, publicClient),
        );

        return tokensObs.length
          ? forkJoin(tokensObs).pipe(
              map((balances) => balances.map((balance, index) => ({ chain, token: chain.tokens[index], balance }))),
            )
          : of([]);
      });

      balanceAllRef.current = [];
      setLoading(true);

      return merge(chainsObs, 3)
        .pipe(mergeAll())
        .subscribe({
          next: (res) => {
            balanceAllRef.current = res.reduce(
              (acc, cur) => acc.concat(cur).sort((a, b) => a.token.symbol.localeCompare(b.token.symbol)),
              balanceAllRef.current,
            );
          },
          error: (err) => {
            console.error(err);
            balanceAllRef.current = [];
            setLoading(false);
          },
          complete: () => {
            setLoading(false);
          },
        });
    } else {
      balanceAllRef.current = [];
      setBalanceAll([]);
      setLoading(false);
    }
  }, [addressForSelectedSourceChain]);

  useEffect(() => {
    const sub$$ = updateBalanceAll();
    return () => {
      sub$$?.unsubscribe();
    };
  }, [updateBalanceAll]);

  useEffect(() => {
    if (!loading) {
      setBalanceAll(balanceAllRef.current);
    }
  }, [loading]);

  return { loadingBalanceAll: loading, balanceAll, updateBalanceAll };
}
