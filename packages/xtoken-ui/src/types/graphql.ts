import { TokenSymbol } from "./token";
import { BridgeCategory } from "./bridge";
import { Network } from "./chain";
import { Address, Hex } from "viem";

/**
 * From indexer
 */

export enum RecordResult {
  PENDING,
  PENDING_TO_REFUND,
  PENDING_TO_CLAIM,
  SUCCESS,
  REFUNDED,
  PENDING_TO_CONFIRM_REFUND,
  FAILED,
}

export interface HistoryRecord {
  id: string;
  fromChain: Network;
  toChain: Network;
  bridge: BridgeCategory;
  reason: string | null;
  nonce: string;
  requestTxHash: Hex;
  responseTxHash: Hex | null;
  sender: Address;
  recipient: Address;
  sendToken: TokenSymbol;
  recvToken: TokenSymbol;
  sendAmount: string;
  recvAmount: string | null;
  startTime: number;
  endTime: number | null;
  result: RecordResult;
  fee: string;
  feeToken: TokenSymbol;
  messageNonce: string | null;
  sendTokenAddress: Address;
  recvTokenAddress: Address | null;
  guardSignatures: string | null;
  relayer: Address | null;
  endTxHash: Hex | null;
  extData: Hex;
}

export interface SupportChains {
  fromChain: Network;
  toChains: Network[];
}

/**
 * Custom
 */

export interface HistoryRecordReqParams {
  id: string;
}

export interface HistoryRecordResData {
  historyRecordById: HistoryRecord | null;
}

export interface HistoryReqParams {
  sender: Address | undefined;
  page: number;
  row: number;
}

export interface HistoryResData {
  historyRecords: {
    total: number;
    records: Pick<
      HistoryRecord,
      | "requestTxHash"
      | "responseTxHash"
      | "fromChain"
      | "toChain"
      | "startTime"
      | "sendToken"
      | "sendAmount"
      | "result"
      | "id"
    >[];
  };
}

export interface HistoryDetailsReqParams {
  txHash: string;
}

export interface HistoryDetailsResData {
  historyRecordByTxHash: Pick<
    HistoryRecord,
    | "requestTxHash"
    | "responseTxHash"
    | "fromChain"
    | "toChain"
    | "startTime"
    | "sendToken"
    | "sendAmount"
    | "result"
    | "id"
  > | null;
}

export interface TxsReqParams {
  sender: string;
  page: number;
  row: number;
}

export interface TxsResData {
  historyRecords: {
    total: number;
    records: Pick<
      HistoryRecord,
      "id" | "fromChain" | "toChain" | "sender" | "recipient" | "sendAmount" | "sendToken" | "startTime" | "result"
    >[];
  };
}
