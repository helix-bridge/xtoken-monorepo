import { ChainConfig } from "@/types";
import { sepolia } from "viem/chains";

export const sepoliaChain: ChainConfig = {
  /**
   * Chain
   */
  ...sepolia,
  network: "sepolia",
  name: "Sepolia",
  rpcUrls: {
    default: {
      http: ["https://1rpc.io/sepolia"],
      webSocket: ["wss://ethereum-sepolia.publicnode.com"],
    },
    public: {
      http: ["https://1rpc.io/sepolia"],
      webSocket: ["wss://ethereum-sepolia.publicnode.com"],
    },
  },

  /**
   * Custom
   */
  logo: "sepolia.png",
  tokens: [
    {
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      outer: "0x0000000000000000000000000000000000000000",
      inner: "0xfB025B0e2FadF33C644fCe3f5409c0cD4a3045dE",
      logo: "eth.png",
      cross: [
        {
          target: { network: "pangoro-dvm", symbol: "xETH" },
          bridge: { category: "xtoken-sepolia-pangoro" },
          action: "issue",
        },
      ],
      category: "eth",
    },
    {
      decimals: 18,
      symbol: "xPRING",
      name: "xPRING",
      type: "erc20",
      address: "0xdE64c6d8b24eeB16D864841d2873aB7a379c45b6",
      outer: "0xdE64c6d8b24eeB16D864841d2873aB7a379c45b6",
      inner: "0x3beb2cf5c2c050bc575350671aa5f06e589386e8",
      logo: "ring.png",
      cross: [
        {
          target: { network: "pangolin-dvm", symbol: "PRING" },
          bridge: { category: "xtoken-pangolin-sepolia" },
          action: "redeem",
        },
      ],
      category: "ring",
    },
  ],
  messager: {
    msgline: "0x2f868b52407b6886214Eb21dF6456c0b308Cc4ce",
  },
};
