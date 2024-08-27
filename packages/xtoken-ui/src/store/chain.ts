import { atom } from "jotai";
import { ChainConfig } from "../types";
import { getSourceChainOptions, getTokenOptions } from "../utils";

const tokenOptions = getTokenOptions();

export const selectedSourceChainAtom = atom<ChainConfig>(getSourceChainOptions(tokenOptions[0].category)[0]);

export function useChain() {
  return null;
}
