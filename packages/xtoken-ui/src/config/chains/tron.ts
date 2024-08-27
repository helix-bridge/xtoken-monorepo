import { ChainConfig, ChainID } from "../../types";

export const tronChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.TRON_MAINNET,
  network: "tron",
  name: "Tron",
  nativeCurrency: {
    name: "TRX",
    symbol: "TRX",
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ["https://api.trongrid.io"],
    },
    public: {
      http: ["https://api.trongrid.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "TronScan",
      url: "https://tronscan.io/#/",
    },
  },

  /**
   * Custom
   */
  logo: "tron.png",
  tokens: [
    {
      decimals: 6,
      symbol: "TRX",
      name: "TRX",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      outer: "0x0000000000000000000000000000000000000000",
      inner: "0x0000000000000000000000000000000000000000", // TODO
      logo: "trx.png",
      cross: [],
      category: "eth",
    },
  ],

  fullNode: "https://api.trongrid.io",
  solidityNode: "https://api.trongrid.io",
  eventServer: "https://api.trongrid.io",
};
