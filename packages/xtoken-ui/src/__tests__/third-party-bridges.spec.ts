import { describe, expect, it } from "@jest/globals";
import { ChainConfig } from "../types/chain";
import { getChainConfigs } from "../utils/chain";

describe.each(getChainConfigs(true) as ChainConfig[])(
  `Should config Third Party Bridges if set onlyThirdParty: $network`,
  ({ tokens, ...chain }) => {
    if (tokens.length) {
      describe.each(tokens)(`$symbol`, ({ cross }) => {
        if (cross.length) {
          it.each(cross)(`$target.network`, (cross) => {
            if (cross.onlyThirdParty) {
              expect(cross.thirdPartyBridges?.length || 0).toBeGreaterThan(0);
            }
          });
        }
      });
    }
  },
);
