import { Token } from "@/types";
import { getTokenLogoSrc } from "@/utils";
import Image from "next/image";

interface Props {
  label: string;
  token: Token;
}

export default function WrapTokenSection({ label, token }: Props) {
  return (
    <div className="bg-background gap-medium p-medium flex flex-col rounded-xl">
      <span className="text-sm font-normal text-white/50">{label}</span>
      <div className="gap-medium flex items-center">
        <Image
          width={30}
          height={30}
          alt={token.symbol}
          src={getTokenLogoSrc(token.logo)}
          className="shrink-0 rounded-full"
        />
        <span className="text-base font-bold text-white">{token.symbol}</span>
      </div>
    </div>
  );
}
