import { TransferContext } from "../providers/transfer-provider";
import { useContext } from "react";

export function useTransfer() {
  return useContext(TransferContext);
}
