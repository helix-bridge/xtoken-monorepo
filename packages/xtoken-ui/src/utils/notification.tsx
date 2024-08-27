import { ChainConfig } from "../types/chain";
import { notification } from "../ui/notification";

import { TransactionReceipt } from "viem";
import NotifyLink from "../ui/notify-link";
import { TronTransactionReceipt } from "../types";
import { getExplorerTxUrl, isTxSuccess } from "./misc";

export function notifyTransaction(
  receipt?: TransactionReceipt | TronTransactionReceipt,
  chain?: ChainConfig,
  title?: string,
) {
  const explorer = chain?.blockExplorers?.default.url;

  if (receipt && "txID" in receipt) {
    const txHash = receipt.txID;
    const href = getExplorerTxUrl(chain, receipt.txID);
    if (isTxSuccess(receipt)) {
      notification.success({
        title: `${title ?? "Transaction"} successful`,
        description: <NotifyLink href={href}>{txHash}</NotifyLink>,
      });
    } else {
      notification.error({
        title: `${title ?? "Transaction"} failed`,
        description: <NotifyLink href={href}>{txHash}</NotifyLink>,
      });
    }
    return;
  }

  const txHash = receipt?.transactionHash;
  const href = new URL(`tx/${txHash}`, explorer).href;

  if (receipt?.status === "success" && txHash) {
    notification.success({
      title: `${title ?? "Transaction"} successful`,
      description: <NotifyLink href={href}>{txHash}</NotifyLink>,
    });
  } else if (receipt?.status === "reverted" && explorer) {
    notification.error({
      title: `${title ?? "Transaction"} failed`,
      description: <NotifyLink href={href}>{txHash}</NotifyLink>,
    });
  }
}

export function notifyError(err: unknown) {
  return notification.error({ title: "An error occurred", description: (err as Error).message });
}
