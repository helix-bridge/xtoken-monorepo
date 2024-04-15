"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import TransferAmountSection from "./transfer-amount-section";
import TransferSwitch from "./transfer-switch";
import WrapTokenSection from "./wrap-token-section";
import abi from "@/abi/wrap-unwrap";
import { Address } from "viem";
import { useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { ChainID, Token } from "@/types";
import { useAllowance, useBalance } from "@/hooks";
import { ethereumChain } from "@/config/chains";
import Image from "next/image";
import Button from "@/ui/button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { notifyError, notifyTransaction } from "@/utils";

interface Amount {
  input: string;
  value: bigint;
  valid: boolean;
  alert: string;
}

const ring: Token = {
  address: "0x9469d013805bffb7d3debe5e7839237e535ec483",
  outer: "0x9469d013805bffb7d3debe5e7839237e535ec483",
  inner: "0x9469d013805bffb7d3debe5e7839237e535ec483",
  logo: "ring.png",
  name: "RING",
  symbol: "RING",
  decimals: 18,
  cross: [],
  type: "erc20",
  category: "ring",
};
const xRing: Token = {
  address: "0x81e32d4652Be82AE225DEdd1bD0bf3BCba8FEE07",
  outer: "0x81e32d4652Be82AE225DEdd1bD0bf3BCba8FEE07",
  inner: "0x81e32d4652Be82AE225DEdd1bD0bf3BCba8FEE07",
  logo: "ring.png",
  name: "xRING",
  symbol: "xRING",
  decimals: 18,
  cross: [],
  type: "erc20",
  category: "ring",
};
const xRingLockBox: Address = "0x00000000062D35A6F9F82305c47A786527896578";

export default function WrapUnwrap() {
  const [sourceToken, _setSourceToken] = useState(ring);
  const [targetToken, _setTargetToken] = useState(xRing);
  const [amount, _setAmount] = useState<Amount>({ input: "", value: 0n, valid: true, alert: "" });

  const sourceTokenRef = useRef(sourceToken);
  const targetTokenRef = useRef(targetToken);
  const amountRef = useRef(amount);

  const setSourceToken = useCallback((v: typeof sourceToken) => {
    _setSourceToken(v);
    sourceTokenRef.current = v;
  }, []);
  const setTargetToken = useCallback((v: typeof targetToken) => {
    _setTargetToken(v);
    targetTokenRef.current = v;
  }, []);
  const setAmount = useCallback((v: typeof amount) => {
    _setAmount(v);
    amountRef.current = v;
  }, []);

  const account = useAccount();
  const network = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [busy, setBusy] = useState(false);
  const {
    balance,
    loading: isLoadingBalance,
    refresh: refreshBalance,
  } = useBalance(ethereumChain, sourceToken, account.address);
  const {
    allowance,
    loading: isLoadingAllowance,
    approve,
    refresh: refreshAllowance,
  } = useAllowance(ethereumChain, sourceToken, account.address, xRingLockBox);

  const actionText = useMemo(() => {
    let result: "Connect Wallet" | "Switch to Ethereum" | "Approve" | "Wrap" | "Unwrap" = "Unwrap";
    if (network.chain?.id) {
      if (network.chain.id === ChainID.ETHEREUM) {
        if (allowance < amount.value) {
          result = "Approve";
        } else if (sourceToken.symbol === "RING") {
          result = "Unwrap";
        } else {
          result = "Wrap";
        }
      } else {
        result = "Switch to Ethereum";
      }
    } else {
      result = "Connect Wallet";
    }
    return result;
  }, [network.chain?.id, sourceToken.symbol, allowance, amount.value]);

  const handleSwitch = useCallback(() => {
    const newSource = { ...targetTokenRef.current };
    const newTarget = { ...sourceTokenRef.current };
    setSourceToken(newSource);
    setTargetToken(newTarget);
  }, [setSourceToken, setTargetToken]);

  const handleWrap = useCallback(async () => {
    if (actionText === "Connect Wallet") {
      openConnectModal?.();
    } else if (actionText === "Switch to Ethereum") {
      switchNetwork?.(ChainID.ETHEREUM);
    } else if (actionText === "Approve") {
      setBusy(true);
      try {
        const receipt = await approve(amountRef.current.value);
        setBusy(false);
        notifyTransaction(receipt, ethereumChain);
        if (receipt?.status === "success") {
          refreshAllowance();
        }
      } catch (err) {
        console.error(err);
        notifyError(err);
        setBusy(false);
      }
    } else if (walletClient) {
      setBusy(true);
      try {
        const hash = await walletClient.writeContract({
          address: xRingLockBox,
          abi,
          functionName: actionText === "Unwrap" ? "withdraw" : "deposit",
          args: [amountRef.current.value],
        });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        setBusy(false);
        notifyTransaction(receipt, ethereumChain);
        if (receipt.status === "success") {
          refreshBalance();
        }
      } catch (err) {
        console.error(err);
        notifyError(err);
        setBusy(false);
      }
    }
  }, [
    actionText,
    publicClient,
    walletClient,
    approve,
    switchNetwork,
    openConnectModal,
    refreshBalance,
    refreshAllowance,
  ]);

  return (
    <>
      <div className="bg-secondary p-large rounded-large mx-auto flex w-full flex-col gap-5 lg:mt-20 lg:w-[26rem] lg:rounded-[1.25rem] lg:p-5">
        <div className="flex flex-col">
          <WrapTokenSection label="You pay" token={sourceToken} />
          <TransferSwitch onSwitch={handleSwitch} />
          <WrapTokenSection label="You receive" token={targetToken} />
        </div>

        <TransferAmountSection
          maxInput
          max={balance}
          balance={balance}
          amount={amount}
          loading={isLoadingBalance}
          chain={ethereumChain}
          token={sourceToken}
          onChange={setAmount}
          onRefresh={refreshBalance}
        />

        <div className="flex flex-col gap-3">
          <Button
            busy={busy}
            kind="primary"
            className="inline-flex h-11 items-center justify-center rounded-full"
            disabled={
              (actionText === "Unwrap" || actionText === "Wrap" || actionText === "Approve") &&
              (isLoadingAllowance || !(amount.valid && amount.input))
            }
            onClick={handleWrap}
          >
            <span className="text-sm font-bold text-white">{actionText}</span>
          </Button>

          {network.chain?.id && network.chain.id !== ChainID.ETHEREUM ? (
            <div className="flex flex-wrap items-center gap-1">
              <Image
                alt="Wrong network"
                width={18}
                height={18}
                src="/images/warning.svg"
                className="shrink-0 rounded-full"
              />
              <span className="text-xs font-bold text-orange-400">Wrong chain, wrap/unwrap is only for Ethereum</span>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
