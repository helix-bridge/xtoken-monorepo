import { ChainConfig, ChainID } from "../../types/chain";

export const crabChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.CRAB,
  network: "crab-dvm",
  name: "Crab",
  nativeCurrency: {
    name: "CRAB",
    symbol: "CRAB",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://crab-rpc.darwinia.network"],
      webSocket: [],
    },
    public: {
      http: ["https://crab-rpc.darwinia.network"],
      webSocket: [],
    },
  },
  blockExplorers: {
    default: {
      name: "CrabScan",
      url: "https://crab-scan.darwinia.network/",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 599936,
    },
  },

  /**
   * Custom
   */
  logo: "crab.png",
  tokens: [
    {
      decimals: 18,
      symbol: "CRAB",
      name: "CRAB",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      outer: "0x0000000000000000000000000000000000000000",
      inner: "0x2D2b97EA380b0185e9fDF8271d1AFB5d2Bf18329",
      logo: "crab.png",
      cross: [
        {
          target: { network: "darwinia-dvm", symbol: "xWCRAB" },
          bridge: { category: "xtoken-crab-darwinia" },
          action: "issue",
        },
      ],
      category: "crab",
    },
    {
      decimals: 18,
      symbol: "xWRING",
      name: "xWRING",
      type: "erc20",
      address: "0x273131F7CB50ac002BDd08cA721988731F7e1092",
      outer: "0x273131F7CB50ac002BDd08cA721988731F7e1092",
      inner: "0x273131F7CB50ac002BDd08cA721988731F7e1092",
      logo: "ring.png",
      cross: [
        {
          target: { network: "darwinia-dvm", symbol: "RING" },
          bridge: { category: "xtoken-darwinia-crab" },
          action: "redeem",
        },
      ],
      category: "ring",
    },
  ],
  messager: {
    msgline: "0x65Be094765731F394bc6d9DF53bDF3376F1Fc8B0",
  },
};
