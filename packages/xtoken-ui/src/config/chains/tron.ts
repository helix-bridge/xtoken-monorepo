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
    {
      decimals: 18,
      symbol: "RING",
      name: "RING",
      type: "erc20",
      address: "0x6e0D26ADf5323F5B82d5714354DC3c6870Adee7C",
      outer: "0x6e0D26ADf5323F5B82d5714354DC3c6870Adee7C",
      inner: "0x8c92517A14889B1EF5cd27995A504f8e35A03531",
      logo: "ring.png",
      cross: [
        {
          target: { network: "darwinia-dvm", symbol: "RING" },
          bridge: { category: "xtoken-darwinia-tron" },
          action: "redeem",
        },
      ],
      category: "ring",
    },
  ],
  messager: { msgline: "0x13Fd60a93feD8141875378Ba57500c5E554C93F2" },

  fullNode: "https://api.trongrid.io",
  solidityNode: "https://api.trongrid.io",
  eventServer: "https://api.trongrid.io",
};
