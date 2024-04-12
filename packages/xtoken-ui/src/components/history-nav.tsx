import { useApp } from "@/hooks";
import { UrlSearchParamKey } from "@/types";
import Link from "next/link";
import { useAccount } from "wagmi";

export default function HistoryNav() {
  const { setRecordsSearch } = useApp();
  const { address } = useAccount();

  return address ? (
    <Link
      href={`/records?${UrlSearchParamKey.ADDRESS}=${address}`}
      onClick={() => setRecordsSearch(address)}
      className="px-large inline-flex h-8 items-center justify-center rounded-xl bg-white/20 text-sm font-bold text-white hover:underline"
    >
      History
    </Link>
  ) : null;
}
