/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class HistoryRecord {
  id: string;
  fromChain: string;
  toChain: string;
  bridge: string;
  reason?: Nullable<string>;
  nonce: BigInt;
  requestTxHash: string;
  responseTxHash?: Nullable<string>;
  sender: string;
  recipient: string;
  sendToken: string;
  recvToken: string;
  sendAmount: string;
  recvAmount?: Nullable<string>;
  startTime: number;
  endTime?: Nullable<number>;
  result: number;
  fee: string;
  feeToken: string;
  messageNonce?: Nullable<string>;
  sendTokenAddress?: Nullable<string>;
  recvTokenAddress?: Nullable<string>;
  sendOuterTokenAddress?: Nullable<string>;
  recvOuterTokenAddress?: Nullable<string>;
  guardSignatures?: Nullable<string>;
  endTxHash?: Nullable<string>;
  extData?: Nullable<string>;
}

export class HistoryRecords {
  total: number;
  records?: Nullable<Nullable<HistoryRecord>[]>;
}

export class SupportChains {
  fromChain: string;
  toChains?: Nullable<Nullable<string>[]>;
}

export class HealthInfo {
  name?: Nullable<string>;
  callTimes?: Nullable<number>;
}

export abstract class IQuery {
  abstract historyRecordById(id?: Nullable<string>): Nullable<HistoryRecord> | Promise<Nullable<HistoryRecord>>;

  abstract historyRecordByTxHash(txHash?: Nullable<string>): Nullable<HistoryRecord> | Promise<Nullable<HistoryRecord>>;

  abstract historyRecords(
    sender?: Nullable<string>,
    recipient?: Nullable<string>,
    relayer?: Nullable<string>,
    needWithdrawLiquidity?: Nullable<boolean>,
    fromChains?: Nullable<Nullable<string>[]>,
    toChains?: Nullable<Nullable<string>[]>,
    bridges?: Nullable<Nullable<string>[]>,
    row?: Nullable<number>,
    page?: Nullable<number>,
    results?: Nullable<Nullable<number>[]>,
    recvTokenAddress?: Nullable<string>,
    order?: Nullable<string>,
  ): Nullable<HistoryRecords> | Promise<Nullable<HistoryRecords>>;

  abstract tasksHealthCheck(
    name?: Nullable<string>,
  ): Nullable<Nullable<HealthInfo>[]> | Promise<Nullable<Nullable<HealthInfo>[]>>;

  abstract queryGuardNeedSignature(
    fromChain?: Nullable<string>,
    toChain?: Nullable<string>,
    bridge?: Nullable<string>,
    guardAddress?: Nullable<string>,
    row?: Nullable<number>,
  ): Nullable<HistoryRecords> | Promise<Nullable<HistoryRecords>>;
}

export abstract class IMutation {
  abstract addGuardSignature(
    id?: Nullable<string>,
    dataHash?: Nullable<string>,
    signature?: Nullable<string>,
  ): Nullable<string> | Promise<Nullable<string>>;
}

export type BigInt = any;
type Nullable<T> = T | null;
