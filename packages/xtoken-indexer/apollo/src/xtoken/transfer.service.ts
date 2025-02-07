import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BaseTransferServiceT2, PartnerT2, Level0IndexerType } from "../base/TransferServiceT2";
import { AddressTokenMap } from "../base/AddressToken";

@Injectable()
export class TransferService extends BaseTransferServiceT2 {
  private readonly darwainiaCrabBackingUrl = this.configService.get<string>("XTOKEN_DARWINIA_CRAB_BACKING");
  private readonly darwainiaCrabIssuingUrl = this.configService.get<string>("XTOKEN_DARWINIA_CRAB_ISSUING");
  private readonly crabDarwiniaBackingUrl = this.configService.get<string>("XTOKEN_CRAB_DARWINIA_BACKING");
  private readonly crabDarwiniaIssuingUrl = this.configService.get<string>("XTOKEN_CRAB_DARWINIA_ISSUING");
  private readonly darwainiaEthereumBackingUrl = this.configService.get<string>("XTOKEN_DARWINIA_ETHEREUM_BACKING");
  private readonly darwainiaEthereumIssuingUrl = this.configService.get<string>("XTOKEN_DARWINIA_ETHEREUM_ISSUING");

  private readonly darwiniaEthereumBackingUrl = this.configService.get<string>("XTOKEN_DARWINIA_ETHEREUM_BACKING");
  private readonly darwiniaEthereumIssuingUrl = this.configService.get<string>("XTOKEN_DARWINIA_ETHEREUM_ISSUING");
  private readonly darwiniaDispatchSubgraph = this.configService.get<string>("XTOKEN_DISPATCH_DARWINIA");
  private readonly crabDispatchSubgraph = this.configService.get<string>("XTOKEN_DISPATCH_CRAB");
  private readonly ethereumDispatchSubgraph = this.configService.get<string>("XTOKEN_DISPATCH_ETHEREUM");

  // testnet
  private readonly ethereumDarwiniaBackingV2Url = this.configService.get<string>("XTOKEN_ETHEREUM_DARWINIA_BACKING_V2");
  private readonly ethereumDarwiniaIssuingV2Url = this.configService.get<string>("XTOKEN_ETHEREUM_DARWINIA_ISSUING_V2");
  private readonly ethereumDispatchSubgraphV2 = this.configService.get<string>("XTOKEN_DISPATCH_ETHEREUM_V2");
  private readonly darwiniaDispatchSubgraphV2 = this.configService.get<string>("XTOKEN_DISPATCH_DARWINIA_V2");

  private readonly fastUrl = this.configService.get<string>("XTOKEN_FAST_URL");
  private readonly slowUrl = this.configService.get<string>("XTOKEN_SLOW_URL");

  formalChainTransfers: PartnerT2[] = [
    {
      chainId: 46,
      chain: "darwinia-dvm",
      urls: [
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
        {
          indexerType: Level0IndexerType.superindex,
          url: this.slowUrl,
        },
      ],
      dispatchUrls: [
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
        {
          indexerType: Level0IndexerType.superindex,
          url: this.slowUrl,
        },
        {
          indexerType: Level0IndexerType.thegraph,
          url: this.darwiniaDispatchSubgraph,
        },
      ],
      bridge: "xtoken-darwinia-crab",
      symbols: [
        {
          key: "RING",
          symbol: "RING",
          address: "0xE7578598Aac020abFB918f33A20faD5B71d670b4",
          outerAddress: "0x0000000000000000000000000000000000000000",
          protocolFee: 0,
          decimals: 18,
        },
      ],
      channels: [
        {
          chain: "crab-dvm",
          channel: "msgport",
        },
      ],
    },
    {
      chainId: 44,
      chain: "crab-dvm",
      urls: [
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
        {
          indexerType: Level0IndexerType.superindex,
          url: this.slowUrl,
        },
      ],
      dispatchUrls: [
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
        {
          indexerType: Level0IndexerType.superindex,
          url: this.slowUrl,
        },
        {
          indexerType: Level0IndexerType.thegraph,
          url: this.crabDispatchSubgraph,
        },
      ],
      bridge: "xtoken-darwinia-crab",
      symbols: [
        {
          key: "RING",
          symbol: "xWRING",
          address: "0x273131F7CB50ac002BDd08cA721988731F7e1092",
          outerAddress: "0x273131F7CB50ac002BDd08cA721988731F7e1092",
          protocolFee: 0,
          decimals: 18,
        },
      ],
      channels: [
        {
          chain: "darwinia-dvm",
          channel: "msgport",
        },
      ],
    },
    {
      chainId: 46,
      chain: "darwinia-dvm",
      urls: [
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
        {
          indexerType: Level0IndexerType.superindex,
          url: this.slowUrl,
        },
      ],
      dispatchUrls: [
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
        {
          indexerType: Level0IndexerType.superindex,
          url: this.slowUrl,
        },
        {
          indexerType: Level0IndexerType.thegraph,
          url: this.darwiniaDispatchSubgraph,
        },
      ],
      bridge: "xtoken-crab-darwinia",
      symbols: [
        {
          key: "CRAB",
          symbol: "xWCRAB",
          address: "0x656567Eb75b765FC320783cc6EDd86bD854b2305",
          outerAddress: "0x656567Eb75b765FC320783cc6EDd86bD854b2305",
          protocolFee: 0,
          decimals: 18,
        },
      ],
      channels: [
        {
          chain: "crab-dvm",
          channel: "msgport",
        },
      ],
    },
    {
      chainId: 44,
      chain: "crab-dvm",
      urls: [
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
        {
          indexerType: Level0IndexerType.superindex,
          url: this.slowUrl,
        },
      ],
      dispatchUrls: [
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
        {
          indexerType: Level0IndexerType.superindex,
          url: this.slowUrl,
        },
        {
          indexerType: Level0IndexerType.thegraph,
          url: this.crabDispatchSubgraph,
        },
      ],
      bridge: "xtoken-crab-darwinia",
      symbols: [
        {
          key: "CRAB",
          symbol: "CRAB",
          address: "0x2D2b97EA380b0185e9fDF8271d1AFB5d2Bf18329",
          outerAddress: "0x0000000000000000000000000000000000000000",
          protocolFee: 0,
          decimals: 18,
        },
      ],
      channels: [
        {
          chain: "darwinia-dvm",
          channel: "msgport",
        },
      ],
    },
    {
      chainId: 46,
      chain: "darwinia-dvm",
      urls: [
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
        {
          indexerType: Level0IndexerType.superindex,
          url: this.slowUrl,
        },
      ],
      dispatchUrls: [
        {
          indexerType: Level0IndexerType.thegraph,
          url: this.darwiniaDispatchSubgraph,
        },
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
        {
          indexerType: Level0IndexerType.superindex,
          url: this.slowUrl,
        },
      ],
      bridge: "xtoken-darwinia-ethereum",
      symbols: [
        {
          key: "RING",
          symbol: "RING",
          address: "0xE7578598Aac020abFB918f33A20faD5B71d670b4",
          outerAddress: "0x0000000000000000000000000000000000000000",
          protocolFee: 0,
          decimals: 18,
        },
        {
          key: "KTON",
          symbol: "KTON",
          address: "0x0000000000000000000000000000000000000402",
          outerAddress: "0x0000000000000000000000000000000000000402",
          protocolFee: 0,
          decimals: 18,
        },
      ],
      channels: [
        {
          chain: "ethereum",
          channel: "msgport",
        },
      ],
    },
    {
      chainId: 1,
      chain: "ethereum",
      urls: [
        {
          indexerType: Level0IndexerType.thegraph,
          url: this.darwainiaEthereumIssuingUrl,
        },
      ],
      dispatchUrls: [
        {
          indexerType: Level0IndexerType.thegraph,
          url: this.ethereumDispatchSubgraph,
        },
      ],
      bridge: "xtoken-darwinia-ethereum",
      symbols: [
        {
          key: "RING",
          symbol: "RING",
          address: "0x81e32d4652Be82AE225DEdd1bD0bf3BCba8FEE07",
          outerAddress: "0x9469D013805bFfB7D3DEBe5E7839237e535ec483",
          protocolFee: 0,
          decimals: 18,
        },
        {
          key: "KTON",
          symbol: "KTON",
          address: "0x9F284E1337A815fe77D2Ff4aE46544645B20c5ff",
          outerAddress: "0x9F284E1337A815fe77D2Ff4aE46544645B20c5ff",
          protocolFee: 0,
          decimals: 18,
        },
      ],
      channels: [
        {
          chain: "darwinia-dvm",
          channel: "msgport",
        },
      ],
    },
    {
      chainId: 46,
      chain: "darwinia-dvm",
      urls: [
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
        {
          indexerType: Level0IndexerType.superindex,
          url: this.slowUrl,
        },
      ],
      dispatchUrls: [
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
        {
          indexerType: Level0IndexerType.superindex,
          url: this.slowUrl,
        },
      ],
      bridge: "xtoken-darwinia-tron",
      symbols: [
        {
          key: "RING",
          symbol: "RING",
          address: "0xE7578598Aac020abFB918f33A20faD5B71d670b4",
          outerAddress: "0x0000000000000000000000000000000000000000",
          protocolFee: 0,
          decimals: 18,
        },
      ],
      channels: [
        {
          chain: "tron",
          channel: "msgport",
        },
      ],
    },
    {
      chainId: 728126428,
      chain: "tron",
      urls: [
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
        {
          indexerType: Level0IndexerType.superindex,
          url: this.slowUrl,
        },
      ],
      dispatchUrls: [
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
        {
          indexerType: Level0IndexerType.superindex,
          url: this.slowUrl,
        },
      ],
      bridge: "xtoken-darwinia-tron",
      symbols: [
        {
          key: "RING",
          symbol: "RING",
          address: "0x8c92517a14889b1ef5cd27995a504f8e35a03531",
          outerAddress: "0x6e0d26adf5323f5b82d5714354dc3c6870adee7c",
          protocolFee: 0,
          decimals: 18,
        },
      ],
      channels: [
        {
          chain: "darwinia-dvm",
          channel: "msgport",
        },
      ],
    }
  ];

  testChainTransfers: PartnerT2[] = [
    {
      chainId: 701,
      chain: "koi",
      urls: [
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
      ],
      dispatchUrls: [
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
      ],
      bridge: "xtoken-koi-tron",
      symbols: [
        {
          key: "RING",
          symbol: "RING",
          address: "0xec8406f4e6B1b853E50c53872648b7BD5e4a7b8a",
          outerAddress: "0x0000000000000000000000000000000000000000",
          protocolFee: 0,
          decimals: 18,
        },
      ],
      channels: [
        {
          chain: "tron-shasta",
          channel: "msgport",
        },
      ],
    },
    {
      chainId: 2494104990,
      chain: "tron-shasta",
      urls: [
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
      ],
      dispatchUrls: [
        {
          indexerType: Level0IndexerType.superindex,
          url: this.fastUrl,
        },
      ],
      bridge: "xtoken-koi-tron",
      symbols: [
        {
          key: "RING",
          symbol: "RING",
          address: "0xefd51a1a0f28f627bd57e62ad61bd3db02b59a5d",
          outerAddress: "0xefa2f03fd5ae000f5064f3d80c2290d0eab8b685",
          protocolFee: 0,
          decimals: 18,
        },
      ],
      channels: [
        {
          chain: "koi",
          channel: "msgport",
        },
      ],
    },
    {
      chainId: 11155111,
      chain: "sepolia",
      urls: [
        {
          indexerType: Level0IndexerType.thegraph,
          url: this.ethereumDarwiniaBackingV2Url,
        },
      ],
      dispatchUrls: [
        {
          indexerType: Level0IndexerType.thegraph,
          url: this.ethereumDispatchSubgraphV2,
        },
      ],
      bridge: "xtoken-sepolia-pangoro",
      symbols: [
        {
          key: "ETH",
          symbol: "ETH",
          address: "0xfB025B0e2FadF33C644fCe3f5409c0cD4a3045dE",
          outerAddress: "0x0000000000000000000000000000000000000000",
          protocolFee: 0,
          decimals: 18,
        },
      ],
      channels: [
        {
          chain: "pangoro-dvm",
          channel: "msgport",
        },
      ],
    },
    {
      chainId: 45,
      chain: "pangoro-dvm",
      urls: [
        {
          indexerType: Level0IndexerType.thegraph,
          url: this.ethereumDarwiniaIssuingV2Url,
        },
      ],
      dispatchUrls: [
        {
          indexerType: Level0IndexerType.thegraph,
          url: this.darwiniaDispatchSubgraphV2,
        },
      ],
      bridge: "xtoken-sepolia-pangoro",
      symbols: [
        {
          key: "ETH",
          symbol: "xETH",
          address: "0x191121eC17587C3cE0BF689AFA36386F8D9C538F",
          outerAddress: "0x191121eC17587C3cE0BF689AFA36386F8D9C538F",
          protocolFee: 0,
          decimals: 18,
        },
      ],
      channels: [
        {
          chain: "sepolia",
          channel: "msgport",
        },
      ],
    },
  ];

  addressToTokenInfo: { [key: string]: AddressTokenMap } = {};

  constructor(public configService: ConfigService) {
    super(configService);
  }
}
