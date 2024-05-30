import { ChainConfig, ChainID } from "../../types/chain";

export const pangoroChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.PANGORO_TANSSI,
  network: "pangoro-dvm",
  name: "Pangoro Tanssi",
  nativeCurrency: {
    name: "ORING",
    symbol: "ORING",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://fraa-flashbox-2871-rpc.a.stagenet.tanssi.network"],
      webSocket: [],
    },
    public: {
      http: ["https://fraa-flashbox-2871-rpc.a.stagenet.tanssi.network"],
      webSocket: [],
    },
  },
  blockExplorers: {
    default: {
      name: "EvmExplorer",
      url: "https://evmexplorer.tanssi-chains.network/",
    },
  },
  testnet: true,

  /**
   * Custom
   */
  logo: "pangoro.png",
  tokens: [
    {
      decimals: 18,
      symbol: "ORING",
      name: "ORING",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      outer: "0x0000000000000000000000000000000000000000",
      inner: "0x617E55f692FA2feFfdD5D9C513782A479cC1FF57", // TODO
      logo: "ring.png",
      cross: [],
      category: "ring",
    },
    {
      decimals: 18,
      symbol: "xETH",
      name: "xETH",
      type: "erc20",
      address: "0x191121eC17587C3cE0BF689AFA36386F8D9C538F",
      outer: "0x191121eC17587C3cE0BF689AFA36386F8D9C538F",
      inner: "0x191121eC17587C3cE0BF689AFA36386F8D9C538F",
      logo: "eth.png",
      cross: [
        {
          target: { network: "sepolia", symbol: "ETH" },
          bridge: { category: "xtoken-pangoro-sepolia" },
          action: "redeem",
        },
      ],
      category: "eth",
    },
  ],
  messager: {
    msgline: "0x093652d52464B6E00d6D95abB7Dc16b4546D83Ca",
  },
};
