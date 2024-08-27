import { ChainConfig, Token } from "../types";
import { Address } from "viem";
import { from } from "rxjs";
import { useCallback, useEffect, useState } from "react";
import { getBalanceEVM, getBalanceTron, isTronChain } from "../utils";

export function useBalance(chain: ChainConfig, token: Token, address?: Address | null) {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0n);

  const updateBalance = useCallback(() => {
    if (address) {
      setLoading(true);
      return from(
        isTronChain(chain) ? getBalanceTron(chain, token, address) : getBalanceEVM(chain, token, address),
      ).subscribe({
        next: (res) => {
          setLoading(false);
          setBalance(res);
        },
        error: (err) => {
          console.error(err);
          setLoading(false);
          setBalance(0n);
        },
      });
    } else {
      setLoading(false);
      setBalance(0n);
    }
  }, [chain, token, address]);

  useEffect(() => {
    const sub$$ = updateBalance();
    return () => {
      sub$$?.unsubscribe();
    };
  }, [updateBalance]);

  return { loading, balance, refresh: updateBalance };
}
