import { ChainConfig, TronTransactionReceipt, TronWebClient } from "../types";
import { RecordResult } from "../types/graphql";
import { Address, Hex, TransactionReceipt } from "viem";
import { isTronChain } from "./chain";
import TronWeb from "tronweb";

export function parseRecordResult(result: RecordResult) {
  switch (result) {
    case RecordResult.PENDING:
      return "Pending";
    case RecordResult.PENDING_TO_CONFIRM_REFUND:
      return "Refunding";
    case RecordResult.PENDING_TO_REFUND:
      return "Pending to Refund";
    case RecordResult.PENDING_TO_CLAIM:
      return "Pending to Claim";
    case RecordResult.REFUNDED:
      return "Refunded";
    case RecordResult.SUCCESS:
      return "Finished";
    default:
      return "Unknown";
  }
}

export function getTokenLogoSrc(fileName: string | null | undefined) {
  return `images/token/${fileName || "unknown.svg"}`;
}

export function getChainLogoSrc(fileName: string | null | undefined) {
  return `images/network/${fileName || "unknown.png"}`;
}

export function getBridgeLogoSrc(fileName: string) {
  return `images/bridge/${fileName}`;
}

export async function fetchMsglineFeeAndParams(
  fromChainId: number,
  toChainId: number,
  fromMessager: Address,
  toMessager: Address,
  recipient: Address,
  payload: Hex,
) {
  const endpoint = "https://msgport-api.ringdao.com/ormp/fee"; // v2
  // const endpoint = "https://msgport-api.darwinia.network/ormp/fee"; // v1
  // const endpoint = "http://g2.generic.darwinia.network:3378/ormp/fee";
  const defaultInput = `${endpoint}?from_chain_id=${fromChainId}&to_chain_id=${toChainId}&payload=${payload}&from_address=${fromMessager}&to_address=${toMessager}&refund_address=${recipient}`;
  const feeData = await fetch(isTronChain({ id: toChainId }) ? `${defaultInput}&gas_limit=200000` : defaultInput);
  const feeJson = await feeData.json();
  if (feeData.ok && feeJson.code === 0) {
    const fee = BigInt(feeJson.data.fee); // In native token
    const extParams = feeJson.data.params as Hex;
    return { fee, extParams };
  }
}

export function getMessagerAddress(sourceChain: ChainConfig | undefined, targetChain: ChainConfig | undefined) {
  let sourceMessager = sourceChain?.messager?.msgline;
  let targetMessager = targetChain?.messager?.msgline;
  if (sourceChain?.network === "darwinia-dvm" && targetChain?.network === "crab-dvm") {
    sourceMessager = "0x65Be094765731F394bc6d9DF53bDF3376F1Fc8B0";
  } else if (sourceChain?.network === "crab-dvm" && targetChain?.network === "darwinia-dvm") {
    targetMessager = "0x65Be094765731F394bc6d9DF53bDF3376F1Fc8B0";
  } else if (sourceChain?.network === "darwinia-dvm" && targetChain?.network === "tron") {
    sourceMessager = "0x65Be094765731F394bc6d9DF53bDF3376F1Fc8B0";
  } else if (sourceChain?.network === "tron" && targetChain?.network === "darwinia-dvm") {
    targetMessager = "0x65Be094765731F394bc6d9DF53bDF3376F1Fc8B0";
  }
  return { sourceMessager, targetMessager };
}

export function getExplorerTxUrl(chain?: ChainConfig | null, tx?: string | null) {
  if (chain && tx) {
    if (isTronChain(chain)) {
      return new URL(`/#/transaction/${tx.startsWith("0x") ? tx.slice(2) : tx}`, chain.blockExplorers?.default.url)
        .href;
    }
    return new URL(`tx/${tx}`, chain.blockExplorers?.default.url).href;
  }
  return "#";
}

export function createTronPublicClient(chain?: ChainConfig | null): TronWebClient | undefined {
  if (chain && isTronChain(chain) && chain.fullNode && chain.solidityNode && chain.eventServer) {
    return new TronWeb(chain.fullNode, chain.solidityNode, chain.eventServer, "01");
  }
}

export function createTronWalletClient(): TronWebClient | undefined {
  if (window.tronWeb && window.tronWeb.defaultAddress?.base58) {
    return window.tronWeb as unknown as TronWebClient;
  }
}

const fakeSleep = (millisecond: number) => new Promise((resolve) => setTimeout(() => resolve([]), millisecond));

export async function waitForTronTransactionReceipt({ client, hash }: { client: TronWebClient; hash: string }) {
  // 45 Seconds
  for (let i = 0; i < 90; i++) {
    try {
      const receipt = await client.trx.getTransaction(hash);
      if (receipt?.ret?.length) {
        return receipt;
      }
    } catch (err) {
      if (err !== "Transaction not found") {
        console.error(err);
      }
    }
    await fakeSleep(500);
  }
}

export function isTxSuccess(receipt?: TransactionReceipt | TronTransactionReceipt): boolean {
  if (
    receipt &&
    (("status" in receipt && receipt.status === "success") ||
      ("ret" in receipt && receipt.ret.some(({ contractRet }) => contractRet === "SUCCESS")))
  ) {
    return true;
  } else {
    return false;
  }
}
