import { Address, createPublicClient, formatUnits, http, PublicClient } from "viem";
import { ChainConfig, Token } from "../types";
import erc20Abi from "../abi/erc20";
import { createTronPublicClient } from "./misc";
import { convertAddressToTron } from "./address";

export function formatBalance(value: bigint, decimals = 18, options?: { precision?: number; keepZero?: boolean }) {
  const precision = options?.precision ?? 4;
  const keepZero = options?.keepZero ?? false;

  const [i, d] = formatUnits(value, decimals).split(".");

  const _integers = i.replace(/(?=(?!^)(\d{3})+$)/g, ",");
  let _decimals = Number(`0.${d || 0}`).toFixed(precision);

  if (!keepZero) {
    _decimals = _decimals.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  }

  return `${_integers}${_decimals.slice(1)}`;
}

export async function getBalance(address: Address, token: Token, publicClient: PublicClient) {
  let value = 0n;
  if (token.type === "native") {
    value = await publicClient.getBalance({ address });
  } else {
    value = await publicClient.readContract({
      address: token.address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    });
  }
  return { value, token };
}

export function getBalanceEVM(chain: ChainConfig, token: Token, address: Address, publicClient?: PublicClient) {
  const _publicClient = publicClient ?? createPublicClient({ transport: http(), chain });
  return token.type === "native"
    ? _publicClient.getBalance({ address })
    : _publicClient.readContract({ address: token.address, abi: erc20Abi, functionName: "balanceOf", args: [address] });
}

export async function getBalanceTron(chain: ChainConfig, token: Token, address: Address) {
  let balance = 0n;
  const tronWeb = createTronPublicClient(chain);
  if (tronWeb) {
    if (token.type === "native") {
      balance = BigInt((await tronWeb.trx.getBalance(convertAddressToTron(address))).toString());
    } else {
      const contract = await tronWeb.contract(erc20Abi, convertAddressToTron(token.address));
      balance = BigInt((await contract.balanceOf(convertAddressToTron(address)).call()).toString());
    }
  }
  return balance;
}
