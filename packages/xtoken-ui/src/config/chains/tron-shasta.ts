import { ChainConfig, ChainID } from "../../types";

export const tronShastaChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.TRON_SHASTA,
  network: "tron-shasta",
  name: "Tron Shasta",
  nativeCurrency: {
    name: "TRX",
    symbol: "TRX",
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ["https://api.shasta.trongrid.io"],
    },
    public: {
      http: ["https://api.shasta.trongrid.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "TronScan",
      url: "https://shasta.tronscan.org/#/",
    },
  },
  testnet: true,

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
      address: "0xefa2F03FD5aE000F5064F3d80C2290d0EAB8b685",
      outer: "0xefa2F03FD5aE000F5064F3d80C2290d0EAB8b685",
      inner: "0xefa2F03FD5aE000F5064F3d80C2290d0EAB8b685",
      logo: "ring.png",
      cross: [
        { target: { network: "koi", symbol: "RING" }, bridge: { category: "xtoken-koi-tron" }, action: "redeem" },
      ],
      category: "ring",
    },
  ],
  messager: { msgline: "0xBa9D1c0eb186f97cFAAC4cA798Ca04FB9bdA2B07" },

  fullNode: "https://api.shasta.trongrid.io",
  solidityNode: "https://api.shasta.trongrid.io",
  eventServer: "https://api.shasta.trongrid.io",
};
