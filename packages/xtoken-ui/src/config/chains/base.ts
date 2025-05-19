import { ChainConfig } from "../../types/chain";
import { base } from "viem/chains";

export const baseChain: ChainConfig = {
  /**
   * Chain
   */
  ...base,
  network: "base",
  name: "Base",

  /**
   * Custom
   */
  logo: "base.png",
  tokens: [
    // TODO: Needs correction
    {
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      outer: "0x0000000000000000000000000000000000000000",
      inner: "0x0000000000000000000000000000000000000000",
      logo: "eth.png",
      cross: [],
      category: "eth",
    },

    {
      decimals: 18,
      symbol: "RING",
      name: "RING",
      type: "erc20",
      address: "0x77Eb290DF0a5aaB15f681085FaeA1F653A3fc9b7",
      outer: "0x77Eb290DF0a5aaB15f681085FaeA1F653A3fc9b7",
      inner: "0x77Eb290DF0a5aaB15f681085FaeA1F653A3fc9b7",
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
      address: "0x166d48F5449315F90cC5543886Bf74bbe6EA3Fb0",
      outer: "0x166d48F5449315F90cC5543886Bf74bbe6EA3Fb0",
      inner: "0x166d48F5449315F90cC5543886Bf74bbe6EA3Fb0",
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
