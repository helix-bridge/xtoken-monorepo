export interface XTokenTransferRecord {
  id: string;
  direction: string;
  remoteChainId: bigint;
  nonce: bigint;
  userNonce: string;
  messageId: string;
  sender: string;
  receiver: string;
  token: string;
  amount: string;
  timestamp: number;
  transactionHash: string;
  fee: string;
  extData: string;
}

export interface XTokenMessageDispatchResult {
  id: string;
  token: string;
  transactionHash: string;
  result: number;
  timestamp: number;
}

export interface XTokenRefundTransferRecord {
  id: string;
  sourceId: string;
  transactionHash: string;
  timestamp: number;
}

export abstract class SourceService {
  abstract queryTransferRecords(
    url: string,
    localChainId: bigint,
    remoteChainId: bigint,
    latestNonce: number,
  ): Promise<XTokenTransferRecord[]>;

  abstract queryMessageDispatchResult(
    url: string,
    localChainId: bigint,
    messageId: string,
  ): Promise<XTokenMessageDispatchResult>;

  abstract queryMessageDispatchResults(
    url: string,
    localChainId: bigint,
    messageIds: string,
  ): Promise<XTokenMessageDispatchResult[]>;

  abstract queryRefundTransferRecords(
    url: string,
    localChainId: bigint,
    sourceId: string,
  ): Promise<XTokenRefundTransferRecord[]>;
}
