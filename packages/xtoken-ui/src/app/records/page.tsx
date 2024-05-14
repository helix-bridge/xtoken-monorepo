import PageWrap from "@/ui/page-wrap";
import dynamic from "next/dynamic";

const Explorer = dynamic(() => import("@/components/explorer"));

export default function Records() {
  return (
    <PageWrap>
      <Explorer />
    </PageWrap>
  );
}
