import { ChainConfig, Token } from "@/types";
import TransferSection from "./transfer-section";
import TransferAmountInput from "./transfer-amount-input";

interface Amount {
  input: string;
  value: bigint;
  valid: boolean;
  alert: string;
}

interface Props {
  min?: bigint;
  max?: bigint;
  token: Token;
  amount: Amount;
  balance: bigint;
  loading?: boolean;
  maxInput?: boolean;
  chain: ChainConfig;
  onRefresh?: () => void;
  onChange?: (amount: Amount) => void;
}

export default function TransferAmountSection({
  min,
  max,
  token,
  chain,
  amount,
  balance,
  loading,
  maxInput,
  onRefresh,
  onChange,
}: Props) {
  return (
    <TransferSection titleText="Amount" alert={amount.alert}>
      <TransferAmountInput
        min={min}
        max={max}
        loading={loading}
        token={token}
        chain={chain}
        balance={balance}
        value={amount}
        maxInput={maxInput}
        onRefresh={onRefresh}
        onChange={onChange}
      />
    </TransferSection>
  );
}
