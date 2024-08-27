export interface InputValue<T = unknown> {
  input: string;
  value: T;
  valid: boolean;
}

export interface BigNumber {
  toString: () => string;
}

export interface TronWebClient {
  contract: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abi: any,
    address: string,
  ) => Promise<{
    [functionName: string]: (...args: unknown[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      call: () => any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      send: (_?: { shouldPollResponse?: boolean; tokenValue?: string; callValue?: string }) => any;
    };
  }>;
  trx: {
    getBalance: (address: string) => BigNumber;
    getTransaction: (hash: string) => Promise<TronTransactionReceipt>;
  };
  isAddress: (address: string) => boolean;
  request: (_: object) => Promise<void>;
}

export interface TronTransactionReceipt {
  ret: { contractRet: "REVERT" | "SUCCESS" }[];
  txID: string;
}
