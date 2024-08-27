import { Address, isAddress } from "viem";
import TronWeb from "tronweb";
import { isTronChain } from "./chain";
import { ChainID } from "../types";

const tronWeb = new TronWeb(
  "https://api.shasta.trongrid.io",
  "https://api.shasta.trongrid.io",
  "https://api.shasta.trongrid.io",
  "01",
);

export function toShortAdrress(address: string, prefixLength = 5, suffixLength = 4) {
  return address.length > 16 ? `${address.slice(0, prefixLength)}...${address.slice(-1 * suffixLength)}` : address;
}

export function convertAddressFromTron(address: string): Address {
  if (tronWeb.isAddress(address)) {
    return `0x${tronWeb.address.toHex(address).slice(2)}`;
  }
  return address as Address;
}

export function convertAddressToTron(address: string): string {
  if (isAddress(address)) {
    return tronWeb.address.fromHex(address);
  }
  return address;
}

export function getAddressForChain(chain?: { id: ChainID }, address?: string | null) {
  if (chain && address) {
    return isTronChain(chain) ? convertAddressToTron(address) : convertAddressFromTron(address);
  }
  return address;
}

export function isTronAddress(address: string): boolean {
  return tronWeb.isAddress(address);
}

export function isEVMAddress(address: string): boolean {
  return isAddress(address);
}

export function isEVMOrTronAddress(address: string): boolean {
  return isTronAddress(address) || isEVMAddress(address);
}
