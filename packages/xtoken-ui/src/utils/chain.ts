import {
  arbitrumChain,
  arbitrumSepoliaChain,
  baseChain,
  darwiniaChain,
  ethereumChain,
  koiChain,
  // pangoroChain,
  polygonChain,
  sepoliaChain,
  tronChain,
  tronShastaChain,
  zksyncSepoliaChain,
} from "../config/chains";
import { ChainConfig, ChainID, Network } from "../types";
import { isMainnet } from "./env";
import { optimismChain } from "../config/chains/optimism";

export function getChainConfig(chainIdOrNetwork?: ChainID | Network | null): ChainConfig | undefined {
  switch (chainIdOrNetwork) {
    case ChainID.DARWINIA:
    case "darwinia-dvm":
      return darwiniaChain;
    case ChainID.ETHEREUM:
    case "ethereum":
      return ethereumChain;
    case ChainID.ARBITRUM:
    case "arbitrum":
      return arbitrumChain;
    case ChainID.ARBITRUM_SEPOLIA:
    case "arbitrum-sepolia":
      return arbitrumSepoliaChain;
    case ChainID.ZKSYNC_SEPOLIA:
    case "zksync-sepolia":
      return zksyncSepoliaChain;
    case ChainID.POLYGON:
    case "polygon":
      return polygonChain;
    case ChainID.BASE:
    case "base":
      return baseChain;
    case ChainID.OPTIMISM:
    case "op":
      return optimismChain;
    case ChainID.SEPOLIA:
    case "sepolia":
      return sepoliaChain;
    // case ChainID.PANGORO_TANSSI:
    // case "pangoro-dvm":
    //   return pangoroChain;
    case ChainID.TRON_SHASTA:
    case "tron-shasta":
      return tronShastaChain;
    case ChainID.TRON_MAINNET:
    case "tron":
      return tronChain;
    case ChainID.KOI:
    case "koi":
      return koiChain;
    default:
      return;
  }
}

export function getChainConfigs(askAll?: boolean) {
  const all = [
    arbitrumChain,
    arbitrumSepoliaChain,
    darwiniaChain,
    ethereumChain,
    sepoliaChain,
    zksyncSepoliaChain,
    polygonChain,
    baseChain,
    optimismChain,
    // pangoroChain,
    koiChain,
    tronShastaChain,
    tronChain,
  ].sort((a, b) => a.name.localeCompare(b.name));

  if (askAll) {
    return all;
  } else if (isMainnet()) {
    return all.filter((c) => !c.hidden && !c.testnet);
  } else {
    return all.filter((c) => !c.hidden && !!c.testnet);
  }
}

export function isTronChain(chain: { id: ChainID }) {
  return [ChainID.TRON_MAINNET, ChainID.TRON_SHASTA].includes(chain.id);
}
