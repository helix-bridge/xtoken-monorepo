import { ChainConfig } from "../../types/chain";
import { parseUnits } from "viem";
import { mainnet } from "viem/chains";

export const ethereumChain: ChainConfig = {
  /**
   * Chain
   */
  ...mainnet,
  network: "ethereum",
  name: "Ethereum",

  /**
   * Custom
   */
  logo: "ethereum.png",
  rpcUrls: {
    default: {
      http: ["https://ethereum-rpc.publicnode.com"],
      webSocket: ["wss://ethereum-rpc.publicnode.com"],
    },
    public: {
      http: ["https://eth.llamarpc.com"],
      webSocket: ["wss://eth.llamarpc.com"],
    },
  },
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
      address: "0x9469d013805bffb7d3debe5e7839237e535ec483",
      outer: "0x9469d013805bffb7d3debe5e7839237e535ec483",
      inner: "0x81e32d4652Be82AE225DEdd1bD0bf3BCba8FEE07",
      logo: "ring.png",
      cross: [
        {
          target: { network: "darwinia-dvm", symbol: "RING" },
          bridge: { category: "lpbridge-ethereum" },
          action: "redeem",
          baseFee: parseUnits("3000", 18),
          index: 0,
          hidden: true,
        },
        {
          target: { network: "darwinia-dvm", symbol: "RING" },
          bridge: { category: "helix-sub2ethv2(unlock)" },
          action: "redeem",
          hidden: true,
        },
        {
          target: { network: "darwinia-dvm", symbol: "RING" },
          bridge: { category: "xtoken-darwinia-ethereum" },
          action: "redeem",
          thirdPartyBridges: [
            {
              name: "Helixbox Bridge",
              logo: "helix-bridge.png",
              url: "https://app.helixbox.ai/#/?token_category=ring&source_chain=ethereum&source_token=RING&target_chain=darwinia-dvm&target_token=RING",
            },
          ],
        },
        {
          target: { network: "arbitrum", symbol: "RING" },
          bridge: { category: "third-party-bridge" },
          thirdPartyBridges: [
            {
              name: "Arbitrum",
              logo: "arbitrum.png",
              url: "https://bridge.arbitrum.io/?destinationChain=arbitrum-one&sourceChain=ethereum",
            },
          ],
          onlyThirdParty: true,
        },
        {
          target: { network: "polygon", symbol: "RING" },
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
        {
          target: { network: "base", symbol: "RING" },
          bridge: { category: "third-party-bridge" },
          thirdPartyBridges: [
            {
              name: "Superbridge",
              logo: "superbridge.png",
              url: "https://superbridge.app",
              xToken: "xRING",
            },
          ],
          onlyThirdParty: true,
        },
        {
          target: { network: "op", symbol: "RING" },
          bridge: { category: "third-party-bridge" },
          thirdPartyBridges: [
            {
              name: "Superbridge",
              logo: "superbridge.png",
              url: "https://superbridge.app",
              xToken: "xRING",
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
      address: "0x9f284e1337a815fe77d2ff4ae46544645b20c5ff",
      outer: "0x9f284e1337a815fe77d2ff4ae46544645b20c5ff",
      inner: "0x35f15275041B53324dF461d5ccC952EE19D4a982",
      logo: "kton.png",
      cross: [
        {
          target: { network: "darwinia-dvm", symbol: "KTON" },
          bridge: { category: "helix-sub2ethv2(unlock)" },
          action: "redeem",
          hidden: true,
        },
        {
          target: { network: "darwinia-dvm", symbol: "KTON" },
          bridge: { category: "xtoken-darwinia-ethereum" },
          action: "redeem",
        },
        {
          target: { network: "arbitrum", symbol: "KTON" },
          bridge: { category: "third-party-bridge" },
          thirdPartyBridges: [
            {
              name: "Arbitrum",
              logo: "arbitrum.png",
              url: "https://bridge.arbitrum.io/?destinationChain=arbitrum-one&sourceChain=ethereum",
            },
          ],
          onlyThirdParty: true,
        },
        {
          target: { network: "polygon", symbol: "KTON" },
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
        {
          target: { network: "base", symbol: "KTON" },
          bridge: { category: "third-party-bridge" },
          thirdPartyBridges: [
            {
              name: "Superbridge",
              logo: "superbridge.png",
              url: "https://superbridge.app",
              xToken: "xKTON",
            },
          ],
          onlyThirdParty: true,
        },
        {
          target: { network: "op", symbol: "KTON" },
          bridge: { category: "third-party-bridge" },
          thirdPartyBridges: [
            {
              name: "Superbridge",
              logo: "superbridge.png",
              url: "https://superbridge.app",
              xToken: "xKTON",
            },
          ],
          onlyThirdParty: true,
        },
      ],
      category: "kton",
    },
  ],
  messager: { msgline: "0x02e5C0a36Fb0C83CCEBCD4D6177A7E223D6f0b7c" },
};
