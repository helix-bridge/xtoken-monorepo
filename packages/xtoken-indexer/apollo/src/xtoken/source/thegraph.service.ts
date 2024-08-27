import axios from "axios";
import {
  XTokenTransferRecord,
  XTokenMessageDispatchResult,
  XTokenRefundTransferRecord,
  SourceService,
} from "./source.service";

export class XTokenThegraphService extends SourceService {
  async queryTransferRecords(
    url: string,
    localChainId: bigint,
    remoteChainId: bigint,
    latestNonce: number,
  ): Promise<XTokenTransferRecord[]> {
    const query = `query { transferRecords(where: {remoteChainId: ${remoteChainId}}, first: 20, orderBy: nonce, orderDirection: asc, skip: ${latestNonce}) { id, direction, remoteChainId, nonce, userNonce, messageId, sender, receiver, token, amount, timestamp, transactionHash, fee, extData } }`;

    return await axios
      .post(url, {
        query: query,
        variables: null,
      })
      .then((res) => res.data?.data?.transferRecords);
  }

  async queryMessageDispatchResult(
    url: string,
    localChainId: bigint,
    messageId: string,
  ): Promise<XTokenMessageDispatchResult> {
    const query = `query { messageDispatchedResult (id: \"${messageId}\") { id, token, transactionHash, result, timestamp }}`;

    return await axios
      .post(url, {
        query: query,
        variables: null,
      })
      .then((res) => res.data?.data?.messageDispatchedResult);
  }

  async queryMessageDispatchResults(
    url: string,
    localChainId: bigint,
    messageIds: string,
  ): Promise<XTokenMessageDispatchResult[]> {
    const query = `query { messageDispatchedResults (where: {id_in: [${messageIds}]}) { id, token, transactionHash, result, timestamp }}`;
    return await axios
      .post(url, {
        query: query,
        variables: null,
      })
      .then((res) => res.data?.data?.messageDispatchedResults);
  }

  async queryRefundTransferRecords(
    url: string,
    localChainId: bigint,
    sourceId: string,
  ): Promise<XTokenRefundTransferRecord[]> {
    const query = `query { refundTransferRecords (where: {sourceId: "${sourceId}"}) { id, sourceId, transactionHash, timestamp }}`;
    return await axios
      .post(url, {
        query: query,
        variables: null,
      })
      .then((res) => res.data?.data?.refundTransferRecords);
  }
}
