import { HistoryRecord } from "../types/graphql";
import { formatBalance } from "../utils/balance";
import { getChainConfig } from "../utils/chain";

interface Props {
  record?: HistoryRecord | null;
}

export default function MessageFee({ record }: Props) {
  const token = getChainConfig(record?.fromChain)?.tokens.find((t) => t.type === "native");

  return (
    <span className="text-sm font-medium text-white">
      {token && record?.fee
        ? `${formatBalance(BigInt(record.fee), token.decimals, { keepZero: false, precision: 12 })} ${token.symbol}`
        : null}
    </span>
  );
}
