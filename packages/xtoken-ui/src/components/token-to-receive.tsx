import { HistoryRecord } from "../types/graphql";
import PrettyAddress from "./pretty-address";
import { createTronWalletClient, getTokenLogoSrc } from "../utils/misc";
import { getChainConfig, isTronChain } from "../utils/chain";
import Button from "../ui/button";
import { convertAddressToTron } from "../utils";
import { Token } from "../types";

interface Props {
  record?: HistoryRecord | null;
}

export default function TokenToReceive({ record }: Props) {
  const chain = getChainConfig(record?.toChain);
  const token = chain?.tokens.find(
    ({ symbol, address }) =>
      symbol === record?.recvToken ||
      (record?.recvTokenAddress && address.toLowerCase() === record.recvTokenAddress?.toLowerCase()),
  );

  return chain && token ? (
    <div className="gap-medium flex items-center">
      {token.type !== "native" && (
        <PrettyAddress
          address={isTronChain(chain) ? convertAddressToTron(token.address) : token.address}
          copyable
          className="text-primary text-sm font-medium"
        />
      )}
      <img width={20} height={20} alt="Token" src={getTokenLogoSrc(token.logo)} className="shrink-0 rounded-full" />
      <span className="text-sm font-medium text-white">{token.symbol}</span>

      {/* add to metamask */}
      {isTronChain(chain) ? <AddAssetTron token={token} /> : <AddAssetEVM token={token} />}
    </div>
  ) : null;
}

function AddAssetEVM({ token }: { token: Token }) {
  return window.ethereum && token.type !== "native" ? (
    <Button
      className="rounded-medium px-medium py-[1px]"
      onClick={async () => {
        try {
          await window.ethereum.request({
            method: "wallet_watchAsset",
            params: {
              type: "ERC20", // Initially only supports ERC20, but eventually more!
              options: {
                address: token.address,
                symbol: token.symbol,
                decimals: token.decimals,
                image: "",
              },
            },
          });
        } catch (err) {
          console.error(err);
        }
      }}
    >
      <span className="text-sm font-medium text-white">Add to MetaMask</span>
    </Button>
  ) : null;
}

function AddAssetTron({ token }: { token: Token }) {
  const tronWeb = createTronWalletClient();
  return tronWeb ? (
    <Button
      className="rounded-medium px-medium py-[1px]"
      onClick={async () => {
        try {
          await tronWeb.request({
            method: "wallet_watchAsset",
            params: { type: "trc20", options: { address: convertAddressToTron(token.address) } },
          });
        } catch (err) {
          console.error(err);
        }
      }}
    >
      <span className="text-sm font-medium text-white">Add to TronWeb</span>
    </Button>
  ) : null;
}
