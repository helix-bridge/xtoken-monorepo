import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule, Scalar } from "@nestjs/graphql";
import { ScheduleModule } from "@nestjs/schedule";
import BigInt from "apollo-type-bigint";
import { join } from "path";
import { AggregationModule } from "./aggregation/aggregation.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TasksModule } from "./tasks/tasks.module";
import { xTokenModule } from "./xtoken/xtoken.module";

const chainEnvFilePath = `.env.${process.env.NODE_ENV || "prod"}`;

@Scalar("BigInt")
export class BigIntScalar extends BigInt {}

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ["./src/**/*.graphql"],
      definitions: {
        path: join(process.cwd(), "src/graphql.ts"),
        outputAs: "class",
      },
    }),
    ConfigModule.forRoot({
      envFilePath: [".env", chainEnvFilePath],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TasksModule,
    AggregationModule,
    xTokenModule,
  ],
  controllers: [AppController],
  providers: [AppService, BigIntScalar],
})
export class AppModule {}
