import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HistoryRecord, Prisma, PrismaClient } from '@prisma/client';
import { HistoryRecords } from '../graphql';
import { GuardService } from '../guard/guard.service';
// export lnbridge service configure
import { last } from 'lodash';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class AggregationService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('aggregation');

  async onModuleInit() {
    await this.$connect();
  }

  constructor(
      private guardService: GuardService,
      private tasksService: TasksService
  ) {
    super();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  async createHistoryRecord(data: Prisma.HistoryRecordCreateInput): Promise<HistoryRecord> {
    return this.historyRecord.create({
      data,
    });
  }

  async deleteHistoryRecord(data: Prisma.HistoryRecordWhereUniqueInput): Promise<HistoryRecord> {
    return this.historyRecord.delete({
      where: data,
    });
  }

  async updateHistoryRecord(params: {
    where: Prisma.HistoryRecordWhereUniqueInput;
    data: Prisma.HistoryRecordUpdateInput;
  }): Promise<HistoryRecord> {
    const { where, data } = params;
    return this.historyRecord.update({
      data,
      where,
    });
  }

  async addGuardSignature(params: {
    where: Prisma.HistoryRecordWhereUniqueInput;
    signature: string;
  }) {
    const { where, signature } = params;
    try {
      const record = await this.historyRecord.findUnique({
        where,
      });
      // tx has been redeemed
      if (record.responseTxHash !== '') {
        return;
      }
      const guard = this.guardService.recoverPubkey(
        record.fromChain,
        record.toChain,
        record.bridge,
        BigInt(last(record.id.split('-'))).toString(),
        record.endTime.toString(),
        record.recvTokenAddress,
        record.recvAmount,
        record.extData,
        signature
      );
      if (!guard) {
        return;
      }
      const value = guard + '-' + signature;
      const signatures = record.guardSignatures === null ? [] : record.guardSignatures.split(',');
      const exist = signatures.find((sig) => sig === value);
      if (exist) {
        return;
      }
      signatures.push(value);

      await this.historyRecord.update({
        where,
        data: {
          guardSignatures: signatures.sort().join(','),
        },
      });
    } catch (error) {
      this.logger.warn(`add guard signature failed ${where}, ${signature}, ${error}`);
    }
  }

  async queryHistoryRecordById(
    historyRecordWhereUniqueInput: Prisma.HistoryRecordWhereUniqueInput
  ): Promise<HistoryRecord | null> {
    return this.historyRecord.findUnique({
      where: historyRecordWhereUniqueInput,
    });
  }

  async queryHistoryRecordFirst(
    historyRecordWhereInput: Prisma.HistoryRecordWhereInput,
    orderBy?: Prisma.Enumerable<Prisma.HistoryRecordOrderByWithRelationAndSearchRelevanceInput>
  ): Promise<HistoryRecord | null> {
    return this.historyRecord.findFirst({
      where: historyRecordWhereInput,
      orderBy,
    });
  }

  async queryHistoryRecords(params: {
    skip?: number;
    take?: number;
    where?: Prisma.HistoryRecordWhereInput;
    orderBy?: Prisma.Enumerable<Prisma.HistoryRecordOrderByWithRelationAndSearchRelevanceInput>;
  }): Promise<HistoryRecords> {
    const { skip, take, where, orderBy } = params;
    const records = await this.historyRecord.findMany({
      skip,
      take,
      where,
      orderBy,
    });
    const total = await this.historyRecord.count({ where });

    return { total, records };
  }

  tasksHealthCheck() {
      return this.tasksService.queryHealthChecks();
  }
}
