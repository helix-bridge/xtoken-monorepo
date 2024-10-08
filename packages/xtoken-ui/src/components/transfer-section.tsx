import { PropsWithChildren } from "react";
import TransferSectionTitle from "./transfer-section-title";
import WalletSVG from "./icons/wallet-svg";
import { Address } from "viem";
import RecipientInput from "./recipient-input";
import { ChainConfig } from "../types";

interface Recipient {
  input: string;
  value: Address | undefined;
  alert?: string;
}

interface Props {
  className?: string;
  titleText?: string;
  titleTips?: string | JSX.Element;
  loading?: boolean;
  alert?: string;
  chain?: ChainConfig;
  recipient?: Recipient;
  expandRecipient?: boolean;
  recipientOptions?: Address[];
  onExpandRecipient?: () => void;
  onRecipientChange?: (value: Recipient) => void;
}

export default function TransferSection({
  alert,
  chain,
  loading,
  children,
  titleText,
  titleTips,
  className,
  recipient,
  expandRecipient,
  recipientOptions,
  onExpandRecipient = () => undefined,
  onRecipientChange = () => undefined,
}: PropsWithChildren<Props>) {
  return (
    <div className={`gap-small flex flex-col transition-opacity ${loading ? "opacity-80" : "opacity-100"}`}>
      <div
        className={`gap-medium rounded-large bg-app-bg py-medium flex flex-col transition-[outline] duration-200 ${className} ${
          alert ? "outline outline-1 outline-orange-400" : "outline-none"
        }`}
      >
        {titleText ? (
          <div className="px-medium flex items-center justify-between">
            <TransferSectionTitle text={titleText} tips={titleTips} />
            {recipient ? (
              <WalletSVG
                className="opacity-50 transition-[transform,opacity] hover:cursor-pointer hover:opacity-100 active:scale-95"
                width={20}
                height={20}
                onClick={onExpandRecipient}
              />
            ) : null}
          </div>
        ) : null}
        {children}
        {expandRecipient && (
          <RecipientInput value={recipient} chain={chain} options={recipientOptions} onChange={onRecipientChange} />
        )}
      </div>
      {alert ? <span className="text-xs font-normal text-orange-400">{alert}</span> : null}
    </div>
  );
}
