import { getChainConfig, getChainLogoSrc } from "../utils";
import { useNetwork } from "wagmi";

export default function ChainIdentity() {
  const { chain } = useNetwork();
  const config = getChainConfig(chain?.id);

  return chain ? (
    <div className="gap-medium border-primary px-medium hidden h-8 max-w-[9rem] items-center rounded-full border lg:flex">
      {config ? (
        <img width={20} height={20} alt="Chain" src={getChainLogoSrc(config.logo)} className="shrink-0 rounded-full" />
      ) : null}
      <span className="truncate text-sm font-bold">{config?.name || chain.name}</span>
    </div>
  ) : null;
}
