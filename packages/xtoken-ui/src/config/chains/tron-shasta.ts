import { Address } from "viem";
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
      address: "0x0000000000000000000000000000000000000000", // TODO
      outer: "0x0000000000000000000000000000000000000000", // TODO
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
      address: "TXpHh528nJWoBj5qwCj2pwDBGSsGt7UPAn" as Address,
      outer: "TXpHh528nJWoBj5qwCj2pwDBGSsGt7UPAn" as Address,
      inner: "TXpHh528nJWoBj5qwCj2pwDBGSsGt7UPAn" as Address,
      logo: "ring.png",
      cross: [
        { target: { network: "koi", symbol: "WKRING" }, bridge: { category: "xtoken-tron-koi" }, action: "issue" },
      ],
      category: "ring",
    },
  ],
  messager: { msgline: "TSyvtuVJsqFwDH6cGazHyBNwMjdiFDVCji" as Address },
};
