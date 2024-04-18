import { Args, Query, Mutation, Resolver } from '@nestjs/graphql';
import { isEmpty, isNull, isUndefined } from 'lodash';
import { AggregationService } from './aggregation.service';
import { Prisma } from '@prisma/client';
import * as ethUtil from 'ethereumjs-util';

@Resolver()
export class AggregationResolver {
  constructor(private aggregationService: AggregationService) {}

  @Query()
  async historyRecordById(@Args('id') id: string) {
    return this.aggregationService.queryHistoryRecordById({
      id: id,
    });
  }

  // query by source tx hash
  @Query()
  async historyRecordByTxHash(@Args('txHash') txHash: string) {
    return this.aggregationService.queryHistoryRecordFirst({
      requestTxHash: txHash,
    });
  }

  @Query()
  async historyRecords(
    @Args('sender') sender: string,
    @Args('recipient') recipient: string,
    @Args('fromChains') fromChains: string[],
    @Args('toChains') toChains: string[],
    @Args('bridges') bridges: string,
    @Args('row') row: number,
    @Args('page') page: number,
    @Args('results') results: number[],
    @Args('recvTokenAddress') recvTokenAddress: string,
    @Args('order') order: string
  ) {
    const orderCondition = order?.split('_');
    const skip = row * page || 0;
    const take = row || 10;
    const orderBy =
      orderCondition && orderCondition.length == 2
        ? { [orderCondition[0]]: orderCondition[1] }
        : { startTime: Prisma.SortOrder.desc };
    const isValid = (item) =>
      !Object.values(item).some((value) => isUndefined(value) || isNull(value) || value === '');

    const accFilters = [{ sender: sender?.toLowerCase() }, { recipient }].filter(isValid);
    const accountCondition = accFilters.length ? { OR: accFilters } : {};
    const resultCondition = results && results.length ? { result: { in: results } } : {};
    const fromChainCondition =
      fromChains && fromChains.length ? { fromChain: { in: fromChains } } : {};
    const toChainCondition = toChains && toChains.length ? { toChain: { in: toChains } } : {};
    const bridgeCondition = bridges && bridges.length ? { bridge: { in: bridges } } : {};
    const recvTokenCondition =
      recvTokenAddress && recvTokenAddress.length ? { recvTokenAddress: recvTokenAddress?.toLowerCase() } : {};
    const chainConditions = {
      AND: {
        ...resultCondition,
        ...fromChainCondition,
        ...toChainCondition,
        ...bridgeCondition,
        ...recvTokenCondition,
      },
    };

    const conditions = {
      ...accountCondition,
      ...chainConditions,
    };

    const where = isEmpty(conditions) ? undefined : conditions;

    return this.aggregationService.queryHistoryRecords({
      skip,
      take,
      where,
      orderBy,
    });
  }

  @Mutation()
  async addGuardSignature(@Args('id') id: string, @Args('signature') signature: string) {
    await this.aggregationService.addGuardSignature({
      where: { id: id },
      signature: signature,
    });
  }

  @Query()
  tasksHealthCheck(
    @Args('name') name: string
  ) {
     const healthChecks = this.aggregationService.tasksHealthCheck();
     if (name !== null) {
       return [
         {
           name: name,
           callTimes: healthChecks[name]
         }
       ];
     }
     return Array.from(healthChecks, ([name, callTimes]) => ({ name, callTimes }));
  }

  @Query()
  async queryGuardNeedSignature(
    @Args('fromChain') fromChain: string,
    @Args('toChain') toChain: string,
    @Args('bridge') bridge: string,
    @Args('guardAddress') guardAddress: string,
    @Args('row') row: number
  ) {
    const take = row || 10;
    const statusPendingToClaim = 2;
    const baseFilters = { fromChain, toChain, bridge };
    const guardNotSigned = { guardSignatures: { search: '!' + guardAddress } };
    const filterResponsed = { responseTxHash: '', result: statusPendingToClaim };

    const where = {
      ...baseFilters,
      ...guardNotSigned,
      ...filterResponsed,
    };

    return this.aggregationService.queryHistoryRecords({
      skip: 0,
      take,
      where,
    });
  }
}
