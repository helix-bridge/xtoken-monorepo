import { ChainConfig } from "@/types/chain";
import { polygon } from "viem/chains";

export const polygonChain: ChainConfig = {
  /**
   * Chain
   */
  ...polygon,
  network: "polygon",
  name: "Polygon PoS",

  /**
   * Custom
   */
  logo: "polygon.png",
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
      address: "0x9C1C23E60B72Bc88a043bf64aFdb16A02540Ae8f",
      outer: "0x9C1C23E60B72Bc88a043bf64aFdb16A02540Ae8f",
      inner: "0x9C1C23E60B72Bc88a043bf64aFdb16A02540Ae8f",
      logo: "ring.png",
      cross: [
        {
          target: { network: "darwinia-dvm", symbol: "RING" },
          bridge: { category: "third-party-bridge" },
          thirdPartyBridges: [
            {
              name: "Helix Bridge",
              logo: "helix-bridge.png",
              url: "https://helixbridge.app/#/?token_category=ring&source_chain=polygon&source_token=RING&target_chain=darwinia-dvm&target_token=RING",
            },
          ],
          onlyThirdParty: true,
        },
        {
          target: { network: "ethereum", symbol: "RING" },
          bridge: { category: "third-party-bridge" },
          thirdPartyBridges: [
            {
              name: "Polygon",
              logo: "polygon.png",
              url: "https://portal.polygon.technology/bridge",
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
      address: "0x9F284E1337A815fe77D2Ff4aE46544645B20c5ff",
      outer: "0x9F284E1337A815fe77D2Ff4aE46544645B20c5ff",
      inner: "0x9F284E1337A815fe77D2Ff4aE46544645B20c5ff",
      logo: "kton.png",
      cross: [
        {
          target: { network: "ethereum", symbol: "KTON" },
          bridge: { category: "third-party-bridge" },
          thirdPartyBridges: [
            {
              name: "Polygon",
              logo: "polygon.png",
              url: "https://portal.polygon.technology/bridge",
            },
          ],
          onlyThirdParty: true,
        },
      ],
      category: "kton",
    },
  ],
};
