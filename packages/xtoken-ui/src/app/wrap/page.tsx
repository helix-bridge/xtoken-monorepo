import PageWrap from "@/ui/page-wrap";
import dynamic from "next/dynamic";

const WrapUnwrap = dynamic(() => import("@/components/wrap-unwrap"), { ssr: false });

export default function Wrap() {
  return (
    <PageWrap>
      <WrapUnwrap />
    </PageWrap>
  );
}
