import {
  L2BridgeCategory,
  HelixLpBridgeCategory,
  HelixBridgeCategory,
  BridgeCategory,
  XTokenBridgeCategory,
} from "./bridge";
import { Network, ChainConfig } from "./chain";
import { TokenSymbol, Token } from "./token";

interface Target {
  network: Network;
  symbol: TokenSymbol;
}

type Action = "issue" | "redeem";

interface ThirdPartyBridge {
  name: string;
  url: string;
  logo: string; // File name
}

export type CrossChain =
  | {
      target: Target;
      bridge: { category: L2BridgeCategory };
      index?: never;
      price?: never;
      baseFee?: never;
      action?: never;
      hidden?: boolean;
      min?: bigint; // Minimum transfer amount
      thirdPartyBridges?: ThirdPartyBridge[];
    }
  | {
      target: Target;
      bridge: { category: HelixBridgeCategory | XTokenBridgeCategory };
      index?: never;
      price?: never;
      baseFee?: never;
      action: Action;
      hidden?: boolean;
      min?: bigint; // Minimum transfer amount
      thirdPartyBridges?: ThirdPartyBridge[];
    }
  | {
      target: Target;
      bridge: { category: HelixLpBridgeCategory };
      index: number; // One of the bridge contract transfer parameters
      price?: bigint; // When transferring native token, we need to set the price
      baseFee: bigint;
      action: Action;
      hidden?: boolean;
      min?: bigint; // Minimum transfer amount
      thirdPartyBridges?: ThirdPartyBridge[];
    };

export type AvailableBridges = {
  [sourceChain in Network]?: {
    [targetChain in Network]?: {
      [sourceToken in TokenSymbol]?: BridgeCategory[];
    };
  };
};

export type AvailableSourceTokens = {
  [sourceChain in Network]?: {
    [targetChain in Network]?: Token[];
  };
};

export type AvailableTargetChains = {
  [sourceChain in Network]?: ChainConfig[];
};

export type AvailableTargetTokens = {
  [sourceChain in Network]?: {
    [targetChain in Network]?: {
      [sourceToken in TokenSymbol]?: Token[];
    };
  };
};
