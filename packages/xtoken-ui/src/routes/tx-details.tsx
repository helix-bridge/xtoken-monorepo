import { useLocation, useParams } from "react-router-dom";
import PageWrap from "../ui/page-wrap";
import RecordDetail from "../components/record-detail";

export default function TxDetails() {
  const params = useParams();
  const location = useLocation();

  return (
    <PageWrap>
      <RecordDetail id={params.id ?? ""} source={location.state?.source} />
    </PageWrap>
  );
}
