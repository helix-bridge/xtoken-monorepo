import { Address } from "viem";
import { CrossChain } from "./cross-chain";

export type TokenCategory = "ring" | "crab" | "eth" | "usdt" | "usdc" | "kton" | "others";

export type TokenSymbol =
  | "ETH"
  | "RING"
  | "USDC"
  | "USDT"
  | "PRING"
  | "ORING"
  | "KRING"
  | "CRAB"
  | "KTON"
  | "WRING"
  | "WKRING"
  | "xCRAB"
  | "xWRING"
  | "xRING"
  | "xKTON"
  | "xWCRAB"
  | "xPRING"
  | "xETH"
  | "MNT"
  | "MATIC"
  | "BNB"
  | "xDai"
  | "TRX";

export type TokenType = "native" | "erc20" | "mapping";

export interface Token {
  decimals: 18 | 6;
  symbol: TokenSymbol; // Also used as id
  name: string;
  type: TokenType;
  address: Address;
  outer: Address; // User-oriented, convertor
  inner: Address; // Bridge-oriented
  logo: string; // File name
  cross: CrossChain[];
  category: TokenCategory;
}

export interface TokenOption {
  logo: string;
  category: TokenCategory;
  symbol: TokenSymbol;
}
