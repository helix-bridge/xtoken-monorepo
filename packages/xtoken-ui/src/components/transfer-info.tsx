import { BaseBridge } from "../bridges/base";
import { Token } from "../types/token";
import CountLoading from "../ui/count-loading";
import Tooltip from "../ui/tooltip";
import { formatBalance } from "../utils/balance";
import { ReactElement, useEffect, useState } from "react";
import { Subscription, from } from "rxjs";

interface Props {
  fee: { loading: boolean; value: bigint; token?: Token } | undefined;
  bridge: BaseBridge | undefined;
}

export default function TransferInfo({ fee, bridge }: Props) {
  const [dailyLimit, setDailyLimit] = useState<{ loading: boolean; limit: bigint; spent: bigint; token: Token }>();

  useEffect(() => {
    let sub$$: Subscription | undefined;
    if (bridge) {
      setDailyLimit((prev) => (prev ? { ...prev, loading: true } : undefined));
      sub$$ = from(bridge.getDailyLimit()).subscribe({
        next: (res) => {
          setDailyLimit(res ? { ...res, loading: false } : undefined);
        },
        error: (err) => {
          console.error(err);
          setDailyLimit(undefined);
        },
      });
    } else {
      setDailyLimit(undefined);
    }
    return () => sub$$?.unsubscribe();
  }, [bridge]);

  return (
    <div className="gap-small bg-inner py-medium flex flex-col rounded-xl px-3">
      <Item label="Estimated Arrival Time" value={bridge?.formatEstimateTime()} />
      <Item
        label="Message Fee"
        value={
          fee?.loading ? (
            <CountLoading color="white" />
          ) : fee?.token && fee.value ? (
            `${formatBalance(fee.value, fee.token.decimals, { precision: 6 })} ${fee.token.symbol}`
          ) : (
            <Tooltip content="Unavailable">
              <img width={16} height={16} alt="Fee" src="images/warning.svg" />
            </Tooltip>
          )
        }
      />
      {dailyLimit ? (
        <Item
          label="Daily Limit"
          value={
            dailyLimit.loading ? (
              <CountLoading color="white" />
            ) : (
              `${formatBalance(dailyLimit.limit, dailyLimit.token.decimals)} ${dailyLimit.token.symbol}`
            )
          }
        />
      ) : null}
    </div>
  );
}

function Item({ label, value, tips }: { label: string; value: ReactElement | string | undefined; tips?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="gap-small flex items-center">
        <span className="text-sm font-extrabold">{label}</span>
        {tips ? (
          <Tooltip content={tips}>
            <img width={14} height={14} alt="Tips" src="images/info.svg" />
          </Tooltip>
        ) : null}
      </div>
      {typeof value === "string" ? <span className="text-sm font-extrabold">{value}</span> : value}
    </div>
  );
}
