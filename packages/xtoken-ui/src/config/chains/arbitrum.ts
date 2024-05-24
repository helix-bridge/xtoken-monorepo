import { ChainConfig } from "@/types/chain";
import { arbitrum } from "viem/chains";

export const arbitrumChain: ChainConfig = {
  /**
   * Chain
   */
  ...arbitrum,
  network: "arbitrum",
  name: "Arbitrum One",

  /**
   * Custom
   */
  logo: "arbitrum.png",
  tokens: [
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
      address: "0x9e523234D36973f9e38642886197D023C88e307e",
      outer: "0x9e523234D36973f9e38642886197D023C88e307e",
      inner: "0x9e523234D36973f9e38642886197D023C88e307e",
      logo: "ring.png",
      cross: [
        {
          target: { network: "darwinia-dvm", symbol: "RING" },
          bridge: { category: "third-party-bridge" },
          thirdPartyBridges: [
            {
              name: "Helix Bridge",
              logo: "helix-bridge.png",
              url: "https://helixbridge.app/#/?token_category=ring&source_chain=arbitrum&source_token=RING&target_chain=darwinia-dvm&target_token=RING",
            },
          ],
          onlyThirdParty: true,
        },
        {
          target: { network: "ethereum", symbol: "RING" },
          bridge: { category: "third-party-bridge" },
          thirdPartyBridges: [
            {
              name: "Arbitrum",
              logo: "arbitrum.png",
              url: "https://bridge.arbitrum.io/?destinationChain=ethereum&sourceChain=arbitrum-one",
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
      address: "0xfd50237e40a287d8ef1cd4552980dd198d2c2678",
      outer: "0xfd50237e40a287d8ef1cd4552980dd198d2c2678",
      inner: "0xfd50237e40a287d8ef1cd4552980dd198d2c2678",
      logo: "kton.png",
      cross: [
        {
          target: { network: "ethereum", symbol: "KTON" },
          bridge: { category: "third-party-bridge" },
          thirdPartyBridges: [
            {
              name: "Arbitrum",
              logo: "arbitrum.png",
              url: "https://bridge.arbitrum.io/?destinationChain=ethereum&sourceChain=arbitrum-one",
            },
          ],
          onlyThirdParty: true,
        },
      ],
      category: "kton",
    },
  ],
  messager: { msgline: "0x65Be094765731F394bc6d9DF53bDF3376F1Fc8B0" },
};
