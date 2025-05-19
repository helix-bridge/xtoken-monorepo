import { ChainConfig } from "../../types/chain";
import { optimism } from "viem/chains";

export const optimismChain: ChainConfig = {
  /**
   * Chain
   */
  ...optimism,
  network: "op",
  name: "OP Mainnet",

  /**
   * Custom
   */
  logo: "optimism.png",
  tokens: [
    {
      decimals: 18,
      symbol: "RING",
      name: "RING",
      type: "erc20",
      address: "0x5ac3F9EDB4896DB1EdC0EF9d91421e740083e6e8",
      outer: "0x5ac3F9EDB4896DB1EdC0EF9d91421e740083e6e8",
      inner: "0x5ac3F9EDB4896DB1EdC0EF9d91421e740083e6e8",
      logo: "ring.png",
      cross: [
        {
          target: { network: "ethereum", symbol: "RING" },
          bridge: { category: "third-party-bridge" },
          thirdPartyBridges: [
            {
              name: "Superbridge",
              logo: "superbridge.png",
              url: "https://superbridge.app",
            },
          ],
          onlyThirdParty: true,
        },
      ],
      category: "ring",
    },
    {
      decimals: 18,
      symbol: "KTON",
      name: "KTON",
      type: "erc20",
      address: "0xEB528F54676dC39e8D62EEc1d4C1AFB25c1b9bB1",
      outer: "0xEB528F54676dC39e8D62EEc1d4C1AFB25c1b9bB1",
      inner: "0xEB528F54676dC39e8D62EEc1d4C1AFB25c1b9bB1",
      logo: "kton.png",
      cross: [
        {
          target: { network: "ethereum", symbol: "KTON" },
          bridge: { category: "third-party-bridge" },
          thirdPartyBridges: [
            {
              name: "Superbridge",
              logo: "superbridge.png",
              url: "https://superbridge.app",
            },
          ],
          onlyThirdParty: true,
        },
      ],
      category: "kton",
    },
  ],
};
