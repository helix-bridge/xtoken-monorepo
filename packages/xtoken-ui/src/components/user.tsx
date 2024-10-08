import { useApp, useWallet } from "../hooks";
import Dropdown from "../ui/dropdown";
import {
  convertAddressToTron,
  formatBalance,
  getChainLogoSrc,
  getTokenLogoSrc,
  isTronChain,
  toShortAdrress,
} from "../utils";
import { PropsWithChildren, useMemo } from "react";
import PrettyAddress from "./pretty-address";
import AddressIdenticon from "./address-identicon";
import { Placement } from "@floating-ui/react";
import ComponentLoading from "../ui/component-loading";
import History from "./history";
import { useAtomValue } from "jotai";
import { selectedSourceChainAtom } from "../store/chain";

interface Props {
  placement: Placement;
  prefixLength?: number;
  suffixLength?: number;
  onComplete?: () => void;
}

export default function User({ placement, prefixLength = 10, suffixLength = 8 }: Props) {
  const { balanceAll, loadingBalanceAll } = useApp();

  const { addressForSelectedSourceChain, disconnectWallet, connectWallet } = useWallet();

  const selectedSourceChain = useAtomValue(selectedSourceChainAtom);
  const addressToDisplay = useMemo(() => {
    if (selectedSourceChain && addressForSelectedSourceChain) {
      if (isTronChain(selectedSourceChain)) {
        return convertAddressToTron(addressForSelectedSourceChain);
      }
      return addressForSelectedSourceChain;
    }
    return undefined;
  }, [addressForSelectedSourceChain, selectedSourceChain]);

  return addressToDisplay ? (
    <Dropdown
      childClassName="bg-background py-large rounded-large border border-white/20 flex flex-col gap-large"
      labelClassName="h-9 lg:h-8 px-large items-center justify-center flex bg-white/10 lg:bg-secondary hover:bg-white/20 rounded-xl gap-2 transition-colors"
      placement={placement}
      label={
        <div className="gap-small flex items-center">
          <AddressIdenticon address={addressToDisplay} diameter={20} />
          <LabelSpan>{toShortAdrress(addressToDisplay)}</LabelSpan>
        </div>
      }
    >
      <div className="gap-medium flex items-center px-5">
        <AddressIdenticon address={addressToDisplay} diameter={32} />
        <PrettyAddress
          forceShort
          prefixLength={prefixLength}
          suffixLength={suffixLength}
          address={addressToDisplay}
          copyable
          disabledTooltip
          className="text-sm font-bold text-white"
        />
      </div>

      <div className="gap-small flex items-center px-5">
        <History className="user-dropdown-item">
          <img width={18} height={18} alt="History" src="images/history.svg" className="shrink-0" />
          <ChildSpan>History</ChildSpan>
        </History>
        <button
          onClick={() => {
            disconnectWallet();
          }}
          className="user-dropdown-item"
        >
          <img width={18} height={18} alt="Disconnect" src="images/disconnect.svg" className="shrink-0" />
          <ChildSpan>Disconnect</ChildSpan>
        </button>
      </div>

      <div className="mx-5 h-[1px] bg-white/10" />

      <div className="relative flex max-h-[40vh] min-h-[2.5rem] flex-col overflow-y-auto px-2 lg:max-h-[72vh]">
        <ComponentLoading
          loading={loadingBalanceAll}
          color="white"
          size="small"
          className="bg-background/50 backdrop-blur-[2px]"
        />

        {balanceAll.filter(({ balance }) => 0 < balance).length ? (
          balanceAll
            .filter(({ balance }) => 0 < balance)
            .map((balance) => (
              <button
                key={`${balance.chain.network}-${balance.token.symbol}`}
                className="gap-large lg:py-medium flex items-center rounded-2xl px-3 py-2 transition-colors hover:bg-white/10 disabled:cursor-default"
                disabled
              >
                <div className="relative">
                  <img
                    alt="Token"
                    width={32}
                    height={32}
                    src={getTokenLogoSrc(balance.token.logo)}
                    className="rounded-full"
                  />
                  <img
                    alt="Chain"
                    width={20}
                    height={20}
                    src={getChainLogoSrc(balance.chain.logo)}
                    className="absolute -bottom-1 -right-1 rounded-full"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-white">
                    {formatBalance(balance.balance, balance.token.decimals)} {balance.token.symbol}
                  </span>
                  <span className="text-xs font-medium text-white/50">{balance.chain.name}</span>
                </div>
              </button>
            ))
        ) : !loadingBalanceAll ? (
          <div className="inline-flex h-10 items-center justify-center">
            <span className="text-sm font-medium text-slate-400">No data</span>
          </div>
        ) : null}
      </div>
    </Dropdown>
  ) : (
    <button
      className="user-connect-wallet"
      onClick={() => {
        if (selectedSourceChain) {
          connectWallet(selectedSourceChain);
        }
      }}
    >
      <LabelSpan>Connect Wallet</LabelSpan>
    </button>
  );
}

function LabelSpan({ children }: PropsWithChildren<unknown>) {
  return <span className="text-sm font-bold text-white">{children}</span>;
}

function ChildSpan({ children }: PropsWithChildren<unknown>) {
  return <span className="text-sm font-medium">{children}</span>;
}
