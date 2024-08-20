import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { last } from "lodash";
import { AggregationService } from "../aggregation/aggregation.service";
import { TasksService } from "../tasks/tasks.service";
import { TransferService } from "./transfer.service";
import {
  PartnerT2,
  PartnerSymbol,
  FetchCacheInfo,
  BridgeBaseConfigure,
  RecordStatus,
  Level0IndexerType,
} from "../base/TransferServiceT2";
import { XTokenThegraphService } from "./source/thegraph.service";
import { XTokenSuperService } from "./source/super.service";

enum xTokenStatus {
  // do nothing
  delivered = 0,
  // relay status: save failed(need refund)
  // refund status: all is failed(need refund)
  failed = 1,
  // relay status: finished
  // refund status: refunded
  deliveredSuccessed = 2,
  // relay status: need to claim
  // refund status: error
  pendingToClaim = 3,
  claimed = 4,
}

@Injectable()
export class xTokenService implements OnModuleInit {
  logger: Logger = new Logger("xtoken");
  baseConfigure: BridgeBaseConfigure = {
    name: "xtoken",
    fetchHistoryDataFirst: 10,
    fetchSendDataInterval: 3000,
    takeEachTime: 3,
  };
  private sourceServices = new Map();
  fetchCache: FetchCacheInfo[] = new Array(this.transferService.transfers.length)
    .fill("")
    .map((_) => ({ latestNonce: -1, isSyncingHistory: false, skip: 0 }));

  constructor(
    public configService: ConfigService,
    protected aggregationService: AggregationService,
    protected taskService: TasksService,
    protected transferService: TransferService,
  ) {}

  async onModuleInit() {
    this.sourceServices.set(Level0IndexerType.thegraph, new XTokenThegraphService());
    this.sourceServices.set(Level0IndexerType.superindex, new XTokenSuperService());

    this.transferService.transfers.forEach((item, index) => {
      this.taskService.addInterval(
        `${item.chain}-${item.bridge}-fetch_history_data`,
        this.baseConfigure.fetchSendDataInterval,
        async () => {
          if (this.fetchCache[index].isSyncingHistory) {
            return;
          }
          this.fetchCache[index].isSyncingHistory = true;
          await this.fetchRecords(item, index);
          await this.fetchStatus(item, index);
          this.fetchCache[index].isSyncingHistory = false;
        },
      );
    });
  }

  private getDestChain(idOrName: string, bridge: string): PartnerT2 | null {
    return (
      this.transferService.transfers.find(
        (transfer) =>
          (transfer.chainId.toString() === idOrName || transfer.chain === idOrName) && transfer.bridge === bridge,
      ) ?? null
    );
  }

  private toMessageNonce(messageId: string, nonce: string): string {
    return `${nonce}-${messageId}`;
  }

  private toMessageId(messageNonce: string): string {
    return last(messageNonce.split("-"));
  }

  private getToken(chain: PartnerT2, symbolOrAddress: string): PartnerSymbol | null {
    return (
      chain.symbols.find(
        (item) => item.key === symbolOrAddress || symbolOrAddress?.toLowerCase() === item.address.toLowerCase(),
      ) ?? null
    );
  }

  genID(from: string, to: string, direction: string, id: string): string {
    return `${from}2${to}-${this.baseConfigure.name}(${direction})-${id}`;
  }

  findPartner(transfer: PartnerT2): PartnerT2 {
    return (
      this.transferService.transfers.find(
        (target) => target.bridge === transfer.bridge && target.chainId !== transfer.chainId,
      ) ?? null
    );
  }

  async queryTransferRecords(transfer: PartnerT2, remoteChainId: number, latestNonce: number) {
    let result = [];
    for (const level0Indexer of transfer.urls) {
      const service = this.sourceServices.get(level0Indexer.indexerType);
      try {
        const response = await service.queryTransferRecords(
          level0Indexer.url,
          transfer.chainId,
          remoteChainId,
          latestNonce,
        );
        if (response && response.length >= result.length) {
          result = response;
        }
      } catch (err) {
        this.logger.warn(
          `try to get records failed, id ${transfer.chainId}, type ${level0Indexer.indexerType}, err ${err}`,
        );
      }
    }
    return result;
  }

  async queryMessageDispatchedResult(transfer: PartnerT2, messageId: string) {
    for (const level0Indexer of transfer.dispatchUrls) {
      const service = this.sourceServices.get(level0Indexer.indexerType);
      try {
        const response = await service.queryMessageDispatchResult(level0Indexer.url, transfer.chainId, messageId);
        if (response) {
          return response;
        }
      } catch (err) {
        this.logger.warn(
          `try to get message dispatch result failed, id ${transfer.chainId}, type ${level0Indexer.indexerType}, messageId ${messageId} err ${err}`,
        );
      }
    }
  }

  async queryMessageDispatchedResults(transfer: PartnerT2, messageIds: string) {
    let result = [];
    for (const level0Indexer of transfer.dispatchUrls) {
      const service = this.sourceServices.get(level0Indexer.indexerType);
      try {
        const response = await service.queryMessageDispatchResults(level0Indexer.url, transfer.chainId, messageIds);
        if (response && response.length >= result.length) {
          result = response;
        }
      } catch (err) {
        this.logger.warn(
          `try to get message dispatch result failed, id ${transfer.chainId}, type ${level0Indexer.indexerType}, messageId ${messageIds} err ${err}`,
        );
      }
    }
    return result;
  }

  async queryRefundTransferRecords(transfer: PartnerT2, sourceId: string) {
    let result = [];
    for (const level0Indexer of transfer.urls) {
      const service = this.sourceServices.get(level0Indexer.indexerType);
      try {
        const response = await service.queryRefundTransferRecords(level0Indexer.url, transfer.chainId, sourceId);
        if (response && response.length >= result.length) {
          result = response;
        }
      } catch (err) {
        this.logger.warn(
          `try to get refund records failed, id ${transfer.chainId}, type ${level0Indexer.indexerType}, err ${err}`,
        );
      }
    }
    return result;
  }

  async fetchRecords(transfer: PartnerT2, index: number) {
    const partner = this.findPartner(transfer);
    if (partner === null) {
      this.logger.error(`xtoken can't find partner ${transfer.chainId}, ${transfer.bridge}`);
      return;
    }

    // the nonce of cBridge message is not increased
    let latestNonce = this.fetchCache[index].latestNonce;
    try {
      if (latestNonce === -1) {
        const firstRecord = await this.aggregationService.queryHistoryRecordFirst(
          {
            fromChain: transfer.chain,
            toChain: partner.chain,
            bridge: transfer.bridge,
          },
          { nonce: "desc" },
        );
        latestNonce = firstRecord ? Number(firstRecord.nonce) : 0;
      }

      const records = await this.queryTransferRecords(transfer, partner.chainId, latestNonce);

      let added = 0;
      if (records && records.length > 0) {
        for (const record of records) {
          const toChain = this.getDestChain(record.remoteChainId.toString(), transfer.bridge);
          let sendTokenInfo, recvTokenInfo;

          if (record.direction === "lock") {
            sendTokenInfo = this.getToken(transfer, record.token);
            recvTokenInfo = this.getToken(toChain, sendTokenInfo?.key);
          } else {
            recvTokenInfo = this.getToken(toChain, record.token);
            sendTokenInfo = this.getToken(transfer, recvTokenInfo?.key);
          }

          if (sendTokenInfo == null) {
            latestNonce += 1;
            continue;
          }
          if (recvTokenInfo == null) {
            latestNonce += 1;
            continue;
          }

          const responseHash = "";
          const result = RecordStatus.pending;
          const endTime = 0;
          await this.aggregationService.createHistoryRecord({
            id: this.genID(transfer.chain, toChain.chain, record.direction, record.id),
            fromChain: transfer.chain,
            toChain: toChain.chain,
            bridge: transfer.bridge,
            messageNonce: this.toMessageNonce(record.messageId, record.userNonce),
            nonce: latestNonce + 1,
            requestTxHash: record.transactionHash,
            sender: record.sender,
            recipient: record.receiver,
            sendToken: sendTokenInfo.symbol,
            recvToken: recvTokenInfo.symbol,
            sendAmount: record.amount,
            recvAmount: record.amount,
            startTime: Number(record.timestamp),
            endTime: endTime,
            result: result,
            fee: record.fee,
            feeToken: sendTokenInfo.symbol,
            responseTxHash: responseHash,
            reason: "",
            sendTokenAddress: sendTokenInfo.address.toLowerCase(),
            recvTokenAddress: recvTokenInfo.address.toLowerCase(),
            sendOuterTokenAddress: sendTokenInfo.outerAddress.toLowerCase(),
            recvOuterTokenAddress: recvTokenInfo.outerAddress.toLowerCase(),
            endTxHash: "",
            extData: record.extData,
          });
          latestNonce += 1;
          added += 1;
        }

        this.logger.log(
          `save new send record succeeded ${transfer.chain}, nonce: ${latestNonce}, added: ${added}/${records.length}`,
        );
        this.fetchCache[index].latestNonce = latestNonce;
      }
    } catch (error) {
      this.logger.warn(`save new send record failed ${transfer.chain}, ${latestNonce}, ${error}`);
    }
  }

  async fetchStatus(transfer: PartnerT2, index: number) {
    const partner = this.findPartner(transfer);
    if (partner === null) {
      this.logger.error(`xtoken can't find partner ${transfer.chainId}, ${transfer.bridge}`);
      return;
    }

    try {
      const uncheckedRecords = await this.aggregationService
        .queryHistoryRecords({
          skip: this.fetchCache[index].skip,
          take: this.baseConfigure.takeEachTime,
          where: {
            fromChain: transfer.chain,
            toChain: partner.chain,
            bridge: transfer.bridge,
            responseTxHash: "",
          },
        })
        .then((result) => result.records);
      if (uncheckedRecords.length < this.baseConfigure.takeEachTime) {
        this.fetchCache[index].skip = 0;
      } else {
        this.fetchCache[index].skip += this.baseConfigure.takeEachTime;
      }

      for (const uncheckedRecord of uncheckedRecords) {
        const sourceId = this.nodeIdToTransferId(uncheckedRecord.id);
        const messageId = this.toMessageId(uncheckedRecord.messageNonce);
        const node = await this.queryMessageDispatchedResult(partner, messageId);

        if (node === undefined || node === null || node.result === null) {
          continue;
        }
        let result = uncheckedRecord.result;
        let responseTxHash = "";
        // failed
        if (node.result === xTokenStatus.failed) {
          //pendingToRefund
          result = RecordStatus.pendingToRefund;
        } else if (node.result === xTokenStatus.deliveredSuccessed) {
          //success
          result = RecordStatus.success;
          responseTxHash = node.transactionHash;
        } else if (node.result === xTokenStatus.pendingToClaim) {
          //pendingToClaim
          result = RecordStatus.pendingToClaim;
        } else if (node.result === xTokenStatus.claimed) {
          //success
          result = RecordStatus.success;
          responseTxHash = node.transactionHash;
        }
        // only pending status for the transfer need to be updated by this dispatch result
        if (uncheckedRecord.result === RecordStatus.pending || uncheckedRecord.result === RecordStatus.pendingToClaim) {
          if (result !== uncheckedRecord.result) {
            this.logger.log(
              `${this.baseConfigure.name} [${uncheckedRecord.fromChain}-${uncheckedRecord.toChain}] status updated, id: ${sourceId}, status ${uncheckedRecord.result}->${result}`,
            );
            await this.aggregationService.updateHistoryRecord({
              where: { id: uncheckedRecord.id },
              data: {
                responseTxHash,
                result,
                endTime: Number(node.timestamp),
              },
            });
            uncheckedRecord.result = result;
          }
        }

        // update refund status
        // 1. pendingToRefund -> pendingToConfirmRefund: refund request sent, no result found
        // 2. pendingToRefund/pendingToConfirmRefund -> refunded: any refund request's result confirmed and successed
        // 3. pendingToConfirmRefund -> pendingToRefund: all refund request confirmed but failed
        if (
          uncheckedRecord.result === RecordStatus.pendingToRefund ||
          uncheckedRecord.result === RecordStatus.pendingToConfirmRefund
        ) {
          const destChain = this.getDestChain(uncheckedRecord.toChain, transfer.bridge);
          // all refund requests
          const nodes = await this.queryRefundTransferRecords(destChain, sourceId);

          if (nodes.length === 0) {
            continue;
          }
          const refundIds = nodes.map((item) => `\"${item.id}\"`).join(",");
          const [successedResult, size] = await this.fetchRefundResult(refundIds, transfer);
          if (successedResult) {
            this.logger.log(
              `${this.baseConfigure.name} refund successed, status from ${uncheckedRecord.result} to ${RecordStatus.refunded}`,
            );
            // refunded
            await this.aggregationService.updateHistoryRecord({
              where: { id: uncheckedRecord.id },
              data: {
                result: RecordStatus.refunded,
                responseTxHash: successedResult.transactionHash,
              },
            });
          } else {
            if (size === nodes.length) {
              // all refunds tx failed -> RecordStatus.pendingToRefund
              if (uncheckedRecord.result != RecordStatus.pendingToRefund) {
                const oldStatus = uncheckedRecord.result;
                uncheckedRecord.result = RecordStatus.pendingToRefund;
                this.logger.log(
                  `${this.baseConfigure.name} no refund successed, status from ${oldStatus} to ${RecordStatus.pendingToRefund}`,
                );
                // update db
                await this.aggregationService.updateHistoryRecord({
                  where: { id: uncheckedRecord.id },
                  data: {
                    result: RecordStatus.pendingToRefund,
                  },
                });
              }
            } else {
              // some tx not confirmed -> RecordStatus.pendingToConfirmRefund
              if (uncheckedRecord.result != RecordStatus.pendingToConfirmRefund) {
                this.logger.log(
                  `${this.baseConfigure.name} [${uncheckedRecord.fromChain}->${uncheckedRecord.toChain}] waiting for refund confirmed, id: ${uncheckedRecord.id} old status ${uncheckedRecord.result}`,
                );
                uncheckedRecord.result = RecordStatus.pendingToConfirmRefund;
                // update db
                await this.aggregationService.updateHistoryRecord({
                  where: { id: uncheckedRecord.id },
                  data: {
                    result: RecordStatus.pendingToConfirmRefund,
                  },
                });
              }
            }
          }
        }
      }
    } catch (error) {
      this.logger.warn(`${this.baseConfigure.name} update status failed, from ${transfer.chain} error ${error}`);
    }
  }

  private nodeIdToTransferId(id: string): string {
    return last(id.split("-"));
  }

  async fetchRefundResult(ids: string, transfer: PartnerT2) {
    const refundResults = await this.queryMessageDispatchedResults(transfer, ids);
    return [refundResults.find((r) => r.result === xTokenStatus.deliveredSuccessed) ?? null, refundResults.length];
  }
}
