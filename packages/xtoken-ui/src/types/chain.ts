import type { Address, Chain } from "wagmi";
import { Token } from "./token";

export enum ChainID {
  DARWINIA = 46,
  CRAB = 44,
  PANGOLIN = 43,
  PANGORO_TANSSI = 45,
  KOI = 701,

  ETHEREUM = 1,
  SEPOLIA = 11155111,

  ARBITRUM = 42161,
  ARBITRUM_SEPOLIA = 421614,

  ZKSYNC = 324,
  ZKSYNC_SEPOLIA = 300,

  POLYGON = 137,
  POLYGON_ZKEVM = 1101,

  BASE = 8453,
  SCROLL = 534352,
  BSC = 56,
  OPTIMISM = 10,
  GNOSIS = 100,
  LINEA = 59144,
  MANTLE = 5000,

  // Tron
  TRON_SHASTA = 2494104990,
  TRON_MAINNET = 728126428,
}

// According to graphql indexer
export type Network =
  | "darwinia-dvm"
  | "crab-dvm"
  | "pangolin-dvm"
  | "pangoro-dvm"
  | "koi"
  | "ethereum"
  | "sepolia"
  | "arbitrum"
  | "arbitrum-sepolia"
  | "zksync"
  | "zksync-sepolia"
  | "linea"
  | "mantle"
  | "polygon"
  | "polygon-zkEvm"
  | "gnosis"
  | "scroll"
  | "base"
  | "op"
  | "bsc"
  | "tron-shasta";

export interface ChainConfig extends Chain {
  /**
   * Chain
   */
  id: ChainID;
  network: Network;

  /**
   * Custom
   */
  logo: string; // File name
  tokens: Token[];
  messager?: { msgline?: Address }; // TODO: https://github.com/helix-bridge/xtoken-monorepo/issues/42
  hidden?: boolean;

  // Tron
  fullNode?: string;
  solidityNode?: string;
  eventServer?: string;
}
