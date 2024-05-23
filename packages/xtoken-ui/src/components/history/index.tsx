"use client";

import { useApp, useHistory } from "@/hooks";
import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import HistoryDetails from "./history-details";
import HistoryTable from "./history-table";
import { useAccount } from "wagmi";
import { RecordResult } from "@/types";

const Modal = dynamic(() => import("./modal"), { ssr: false });

export default function History({ children, className }: PropsWithChildren<{ className: string }>) {
  const account = useAccount();
  const [currentPage, setCurrentPage] = useState(0);
  const { isHistoryOpen, historyDetails, setIsHistoryOpen, setHistoryDetails } = useApp();
  const { loading, data, total, refetch } = useHistory(currentPage, isHistoryOpen);

  useEffect(() => {
    if (isHistoryOpen) {
      refetch();
    } else {
      setCurrentPage(0);
      setHistoryDetails(null);
    }
  }, [isHistoryOpen, refetch, setHistoryDetails]);

  const historyRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const nodeRef = historyDetails ? detailsRef : historyRef;

  const handleRowClick = useCallback(
    (r: (typeof data)[0]) =>
      setHistoryDetails(r.result === RecordResult.SUCCESS ? { data: r } : { hash: r.requestTxHash }),
    [setHistoryDetails],
  );

  return account.address ? (
    <>
      <button
        className={className}
        onClick={(e) => {
          e.stopPropagation();
          setIsHistoryOpen(true);
        }}
      >
        {children ?? <span>History</span>}
      </button>

      <Modal
        isOpen={isHistoryOpen}
        isDetail={!!historyDetails}
        onClose={() => setIsHistoryOpen(false)}
        onBack={() => setHistoryDetails(null)}
      >
        <SwitchTransition>
          <CSSTransition
            key={historyDetails ? "detail" : "history"}
            classNames={historyDetails ? "history-detail-fade" : "history-table-fade"}
            timeout={100}
            nodeRef={nodeRef}
            unmountOnExit
          >
            <div ref={nodeRef}>
              {historyDetails ? (
                <HistoryDetails requestTxHash={historyDetails.hash} defaultData={historyDetails.data} />
              ) : (
                <HistoryTable
                  onPageChange={setCurrentPage}
                  onRowClick={handleRowClick}
                  currentPage={currentPage}
                  totalRecords={total}
                  dataSource={data}
                  loading={loading}
                />
              )}
            </div>
          </CSSTransition>
        </SwitchTransition>
      </Modal>
    </>
  ) : null;
}
