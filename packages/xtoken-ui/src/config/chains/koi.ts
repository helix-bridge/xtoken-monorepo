import { ChainConfig, ChainID } from "../../types/chain";

export const koiChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.KOI,
  network: "koi",
  name: "Koi",
  nativeCurrency: {
    name: "KRING",
    symbol: "KRING",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://koi-rpc.darwinia.network"],
      webSocket: ["wss://koi-rpc.darwinia.network"],
    },
    public: {
      http: ["https://koi-rpc.darwinia.network"],
      webSocket: ["wss://koi-rpc.darwinia.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "KoiScan",
      url: "https://koi-scan.darwinia.network/",
    },
  },
  testnet: true,

  /**
   * Custom
   */
  logo: "koi.png",
  tokens: [
    {
      decimals: 18,
      symbol: "KRING",
      name: "KRING",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      outer: "0x0000000000000000000000000000000000000000",
      inner: "0x0000000000000000000000000000000000000000", // TODO
      logo: "ring.png",
      cross: [],
      category: "ring",
    },
    {
      decimals: 18,
      symbol: "RING",
      name: "RING",
      type: "erc20",
      address: "0xec8406f4e6B1b853E50c53872648b7BD5e4a7b8a",
      outer: "0xec8406f4e6B1b853E50c53872648b7BD5e4a7b8a",
      inner: "0xec8406f4e6B1b853E50c53872648b7BD5e4a7b8a",
      logo: "ring.png",
      cross: [
        {
          target: { network: "tron-shasta", symbol: "RING" },
          bridge: { category: "xtoken-koi-tron" },
          action: "redeem",
        },
      ],
      category: "ring",
    },
  ],
  messager: { msgline: "0x3a245f8c3daec18fd7df247f4fcb6fa2a3f2fcef" },
};
