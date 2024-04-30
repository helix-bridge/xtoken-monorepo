import { gql } from "@apollo/client";

export const GQL_HISTORY_RECORD_BY_ID = gql`
  query historyRecordById($id: String!) {
    historyRecordById(id: $id) {
      sendAmount
      recvAmount
      bridge
      endTime
      fee
      feeToken
      fromChain
      guardSignatures
      id
      nonce
      messageNonce
      recipient
      requestTxHash
      responseTxHash
      reason
      result
      sender
      startTime
      toChain
      sendToken
      recvToken
      sendTokenAddress
      recvTokenAddress
      extData
    }
  }
`;

export const GQL_GET_HISTORY = gql`
  query GetHistory($sender: String, $page: Int, $row: Int) {
    historyRecords(sender: $sender, page: $page, row: $row) {
      total
      records {
        requestTxHash
        responseTxHash
        fromChain
        toChain
        startTime
        sendToken
        sendAmount
        result
        id
      }
    }
  }
`;

export const GQL_GET_TXS = gql`
  query GetTXS($sender: String, $page: Int, $row: Int) {
    historyRecords(sender: $sender, page: $page, row: $row) {
      total
      records {
        id
        fromChain
        toChain
        sender
        recipient
        sendAmount
        sendToken
        startTime
        result
      }
    }
  }
`;
