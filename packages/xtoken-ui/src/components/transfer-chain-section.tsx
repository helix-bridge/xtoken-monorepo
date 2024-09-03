import { ChainConfig, Token } from "../types";
import TransferSection from "./transfer-section";
import TransferChainSelect from "./transfer-chain-select";
import TransferSwitch from "./transfer-switch";
import ComponentLoading from "../ui/component-loading";
import { Address } from "viem";
import { convertAddressToTron, getTokenLogoSrc, isTronChain, toShortAdrress } from "../utils";
import CopyIcon from "../ui/copy-icon";
import { useMemo } from "react";

interface Recipient {
  input: string;
  value: Address | undefined;
  alert?: string;
}

interface Props {
  loading?: boolean;
  recipient?: Recipient;
  sourceChain: ChainConfig;
  targetChain: ChainConfig;
  sourceToken: Token;
  targetToken: Token;
  sourceChainOptions: ChainConfig[];
  targetChainOptions: ChainConfig[];
  sourceTokenOptions: Token[];
  targetTokenOptions: Token[];
  disableSwitch?: boolean;
  expandRecipient?: boolean;
  recipientOptions?: Address[];
  onSwitch?: () => void;
  onExpandRecipient?: () => void;
  onSourceChainChange?: (chain: ChainConfig) => void;
  onTargetChainChange?: (chain: ChainConfig) => void;
  onSourceTokenChange?: (token: Token) => void;
  onTargetTokenChange?: (token: Token) => void;
  onRecipientChange?: (recipient: Recipient) => void;
}

export default function TransferChainSection({
  loading,
  recipient,
  disableSwitch,
  expandRecipient,
  recipientOptions,
  sourceChain,
  targetChain,
  sourceToken,
  targetToken,
  sourceChainOptions,
  targetChainOptions,
  sourceTokenOptions,
  targetTokenOptions,
  onSwitch,
  onExpandRecipient,
  onRecipientChange,
  onSourceChainChange,
  onTargetChainChange,
  onSourceTokenChange,
  onTargetTokenChange,
}: Props) {
  return (
    <div className="relative flex flex-col">
      <ComponentLoading loading={loading} color="white" />
      <TransferSection
        loading={loading}
        titleText="From"
        titleTips={<TokenTips token={sourceToken} chain={sourceChain} />}
      >
        <TransferChainSelect
          chain={sourceChain}
          token={sourceToken}
          chainOptions={sourceChainOptions}
          tokenOptions={sourceTokenOptions}
          onChainChange={onSourceChainChange}
          onTokenChange={onSourceTokenChange}
        />
      </TransferSection>
      <TransferSwitch disabled={disableSwitch || loading} onSwitch={onSwitch} />
      <TransferSection
        loading={loading}
        titleText="To"
        titleTips={<TokenTips token={targetToken} chain={targetChain} />}
        recipient={recipient}
        chain={targetChain}
        alert={recipient?.alert}
        expandRecipient={expandRecipient}
        recipientOptions={recipientOptions}
        onExpandRecipient={onExpandRecipient}
        onRecipientChange={onRecipientChange}
      >
        <TransferChainSelect
          chain={targetChain}
          token={targetToken}
          chainOptions={targetChainOptions}
          tokenOptions={targetTokenOptions}
          onChainChange={onTargetChainChange}
          onTokenChange={onTargetTokenChange}
        />
      </TransferSection>
    </div>
  );
}

function TokenTips({ token, chain }: { token: Token; chain: ChainConfig }) {
  const [explorerUrl, tokenAddress] = useMemo(() => {
    if (isTronChain(chain)) {
      const address = convertAddressToTron(token.address);
      const explorer = new URL(`/#/address/${address}`, chain.blockExplorers?.default.url);
      return [explorer, address];
    }
    return [new URL(`/address/${token.address}`, chain.blockExplorers?.default.url), token.address];
  }, [chain, token.address]);

  return (
    <div className="gap-small flex flex-col">
      <div className="gap-small flex items-center">
        <img alt="Token" width={18} height={18} src={getTokenLogoSrc(token.logo)} />
        <span className="text-xs font-medium text-white">
          {token.symbol}
          {token.type === "native" ? " (native token)" : null}
        </span>
      </div>
      {token.type === "native" ? null : (
        <div className="inline-flex items-center gap-1">
          <a
            className="text-xs font-normal text-white hover:underline"
            rel="noopener noreferrer"
            target="_blank"
            href={explorerUrl.href}
          >
            {toShortAdrress(tokenAddress, 12, 10)}
          </a>
          <CopyIcon text={tokenAddress} copiedColor="#ffffff" />
        </div>
      )}
    </div>
  );
}
