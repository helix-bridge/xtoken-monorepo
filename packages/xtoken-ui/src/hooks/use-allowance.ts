import { useCallback, useEffect, useState } from "react";
import { Address, createPublicClient, http } from "viem";
import { from } from "rxjs";
import abi from "../abi/erc20";
import { ChainConfig, Token } from "../types";
import { usePublicClient, useWalletClient } from "wagmi";
import {
  convertAddressToTron,
  createTronPublicClient,
  createTronWalletClient,
  isTronChain,
  isTxSuccess,
  notifyError,
  waitForTronTransactionReceipt,
} from "../utils";

function getAllowanceEVM(chain: ChainConfig, token: Token, owner: Address, spender: Address) {
  const publicClient = createPublicClient({ chain, transport: http() });
  return publicClient.readContract({ address: token.address, abi, functionName: "allowance", args: [owner, spender] });
}

async function getAllowanceTron(chain: ChainConfig, token: Token, owner: Address, spender: Address) {
  let allowance = 0n;
  const tronWeb = createTronPublicClient(chain);
  if (tronWeb) {
    const contract = await tronWeb.contract(abi, convertAddressToTron(token.address));
    allowance = BigInt(
      (await contract.allowance(convertAddressToTron(owner), convertAddressToTron(spender)).call()).toString(),
    );
  }
  return allowance;
}

export function useAllowance(
  chain: ChainConfig,
  token: Token,
  owner: Address | null | undefined,
  spender: Address | null | undefined,
) {
  const [allowance, setAllowance] = useState(0n);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const update = useCallback(() => {
    const max = BigInt(Number.MAX_SAFE_INTEGER) ** BigInt(token.decimals);

    if (token.type === "native") {
      setAllowance(max);
      setLoading(false);
    } else if (owner && spender) {
      setLoading(true);
      return from(
        isTronChain(chain)
          ? getAllowanceTron(chain, token, owner, spender)
          : getAllowanceEVM(chain, token, owner, spender),
      ).subscribe({
        next: (res) => {
          setLoading(false);
          setAllowance(res);
        },
        error: (err) => {
          console.error(err);
          setLoading(false);
          setAllowance(0n);
        },
      });
    } else {
      setAllowance(0n);
      setLoading(false);
    }
  }, [chain, owner, spender, token]);

  const approve = useCallback(
    async (amount: bigint) => {
      if (isTronChain(chain)) {
        const tronWeb = createTronWalletClient();
        if (tronWeb && owner && spender) {
          setBusy(true);
          try {
            const contract = await tronWeb.contract(abi, convertAddressToTron(token.address));
            const hash = await contract.approve(convertAddressToTron(spender), amount.toString()).send();
            const receipt = await waitForTronTransactionReceipt({ client: tronWeb, hash });
            if (isTxSuccess(receipt)) {
              setAllowance(await getAllowanceTron(chain, token, owner, spender));
            }
            setBusy(false);
            return receipt;
          } catch (err) {
            console.error(err);
            notifyError(err);
            setBusy(false);
          }
        }
      } else if (owner && spender && walletClient) {
        setBusy(true);
        try {
          const hash = await walletClient.writeContract({
            address: token.address,
            abi,
            functionName: "approve",
            args: [spender, amount],
          });
          const receipt = await publicClient.waitForTransactionReceipt({ hash });
          if (receipt.status === "success") {
            setAllowance(await getAllowanceEVM(chain, token, owner, spender));
          }
          setBusy(false);
          return receipt;
        } catch (err) {
          console.error(err);
          notifyError(err);
          setBusy(false);
        }
      }
    },
    [owner, spender, token, chain, publicClient, walletClient],
  );

  useEffect(() => {
    const sub$$ = update();
    return () => {
      sub$$?.unsubscribe();
    };
  }, [update]);

  return { loading, busy, allowance, refresh: update, approve };
}
