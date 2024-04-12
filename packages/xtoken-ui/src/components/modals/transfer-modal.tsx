import { BaseBridge } from "@/bridges";
import { useApp, useTransfer } from "@/hooks";
import { ChainConfig, InputValue, Token } from "@/types";
import { formatBalance, getChainLogoSrc, notifyError, toShortAdrress } from "@/utils";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Address, Hex, parseUnits } from "viem";

const Modal = dynamic(() => import("@/ui/modal"), { ssr: false });

interface Props {
  sender?: `0x${string}` | null;
  recipient?: `0x${string}` | null;
  transferAmount: InputValue<bigint>;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransferModal({ sender, recipient, transferAmount, isOpen, onClose }: Props) {
  const { updateBalances } = useApp();
  const { bridgeInstance, sourceChain, targetChain, sourceToken, targetToken, bridgeFee, transfer } = useTransfer();
  const [txHash, setTxHash] = useState<Hex>("0x");
  const [busy, setBusy] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const handleTransfer = useCallback(async () => {
    if (sender && recipient && sourceChain && bridgeInstance) {
      setBusy(true);
      try {
        const receipt = await transfer(sender, recipient, transferAmount.value, bridgeInstance, sourceChain, {
          totalFee: (
            await bridgeInstance.getFee({
              sender,
              recipient,
              transferAmount: transferAmount.value,
            })
          )?.value,
        });

        if (receipt?.status === "success") {
          setTxHash(receipt.transactionHash);
          updateBalances();
          setDisabled(true);
        }
      } catch (err) {
        console.error(err);
        notifyError(err);
      } finally {
        setBusy(false);
      }
    }
  }, [sender, recipient, sourceChain, transferAmount, bridgeInstance, transfer, updateBalances]);

  // Reset state
  useEffect(() => {
    if (isOpen) {
      //
    } else {
      setTxHash("0x");
      setBusy(false);
      setDisabled(false);
    }
  }, [isOpen]);

  return (
    <Modal
      title="Transfer Summary"
      isOpen={isOpen}
      className="w-full lg:w-[34rem]"
      okText="Confirm"
      disabledCancel={busy || disabled}
      disabledOk={disabled}
      busy={busy}
      forceFooterHidden={txHash === "0x" ? false : true}
      onClose={onClose}
      onCancel={onClose}
      onOk={handleTransfer}
    >
      {/* From-To */}
      <div className="gap-small flex flex-col">
        <SourceTarget
          type="source"
          address={sender}
          chain={sourceChain}
          token={sourceToken}
          transferAmount={transferAmount}
        />
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center">
            <Image width={36} height={36} alt="Transfer to" src="images/transfer-to.svg" className="shrink-0" />
          </div>
        </div>
        <SourceTarget
          type="target"
          address={recipient}
          chain={targetChain}
          token={targetToken}
          transferAmount={transferAmount}
        />
      </div>

      {/* information */}
      <div className="gap-medium flex flex-col">
        <span className="text-sm font-extrabold text-white">Information</span>
        <Information fee={bridgeFee} bridge={bridgeInstance} />
      </div>

      {txHash !== "0x" ? (
        <div className="px-medium inline-flex items-center justify-center text-sm font-bold text-white lg:px-3">
          View this on &nbsp;
          <a
            className="text-primary hover:underline"
            target="_blank"
            href={`${new URL(`tx/${txHash}`, sourceChain?.blockExplorers?.default.url).href}`}
          >
            Explorer
          </a>
          .
        </div>
      ) : null}
    </Modal>
  );
}

function SourceTarget({
  type,
  address,
  chain,
  token,
  transferAmount,
}: {
  type: "source" | "target";
  transferAmount: InputValue<bigint>;
  chain?: ChainConfig;
  token?: Token;
  address?: Address | null;
}) {
  return chain && token ? (
    <div className="bg-inner p-medium flex items-center justify-between rounded-xl lg:p-3">
      {/* Left */}
      <div className="gap-medium flex items-center">
        <Image width={36} height={36} alt="Chain" src={getChainLogoSrc(chain.logo)} className="shrink-0 rounded-full" />
        <div className="gap-small flex flex-col items-start">
          <span className="text-base font-bold text-white">{chain.name}</span>
          <span className="hidden text-sm font-bold text-white/50 lg:inline">{address}</span>
          {address ? (
            <span className="text-sm font-bold text-white/50 lg:hidden">{toShortAdrress(address, 8, 6)}</span>
          ) : null}
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end">
        <span className={`text-base font-bold ${type === "source" ? "text-app-red" : "text-app-green"}`}>
          {type === "source" ? "-" : "+"}
          {formatBalance(parseUnits(transferAmount.input, token.decimals), token.decimals)}
        </span>
        <span className="text-sm font-bold text-white">{token.symbol}</span>
      </div>
    </div>
  ) : null;
}

function Information({ fee, bridge }: { fee?: { value: bigint; token: Token }; bridge?: BaseBridge | null }) {
  return (
    <div className="gap-small bg-inner p-medium flex flex-col rounded-xl lg:p-3">
      <Item
        label="Message Fee"
        value={
          fee
            ? `${formatBalance(fee.value, fee.token.decimals, { precision: 6, keepZero: false })} ${fee.token.symbol}`
            : null
        }
      />
      <Item label="Estimated Arrival Time" value={bridge?.formatEstimateTime()} />
    </div>
  );
}

function Item({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="gap-medium flex items-center justify-between text-sm font-bold text-white">
      <span>{label}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}
