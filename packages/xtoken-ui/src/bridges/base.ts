import {
  BridgeCategory,
  BridgeConstructorArgs,
  BridgeContract,
  BridgeLogo,
  ChainConfig,
  CrossChain,
  GetFeeArgs,
  HistoryRecord,
  Token,
  TransferOptions,
  TronTransactionReceipt,
  TronWebClient,
} from "../types";
import {
  convertAddressToTron,
  createTronPublicClient,
  createTronWalletClient,
  getBalance,
  isTronChain,
  waitForTronTransactionReceipt,
} from "../utils";
import { Address, PublicClient as ViemPublicClient, TransactionReceipt, createPublicClient, http } from "viem";
import { PublicClient as WagmiPublicClient, WalletClient } from "wagmi";
import erc20Abi from "../abi/erc20";
import { TX_CONFIRMATIONS } from "../config";

export abstract class BaseBridge {
  protected logo: BridgeLogo = { symbol: "", horizontal: "" };
  protected name: string = "";
  protected estimateTime = { min: 5, max: 20 }; // In minute

  protected readonly category: BridgeCategory;
  protected contract: BridgeContract | undefined;
  protected convertor: { source?: Address; target?: Address } | undefined;

  protected readonly sourceChain?: ChainConfig;
  protected readonly targetChain?: ChainConfig;
  protected readonly sourceToken?: Token;
  protected readonly targetToken?: Token;
  protected readonly sourceNativeToken?: Token;
  protected readonly targetNativeToken?: Token;
  protected readonly crossInfo?: CrossChain;

  protected readonly sourcePublicClient: ViemPublicClient | undefined;
  protected readonly targetPublicClient: ViemPublicClient | undefined;
  protected readonly publicClient?: WagmiPublicClient; // The public client to which the wallet is connected
  protected readonly walletClient?: WalletClient | null;
  protected readonly sourceTronWebPublicClient?: TronWebClient;
  protected readonly targetTronWebPublicClient?: TronWebClient;

  constructor(args: BridgeConstructorArgs) {
    this.category = args.category;
    this.crossInfo = args.sourceChain?.tokens
      .find((t) => t.symbol === args.sourceToken?.symbol)
      ?.cross.find(
        (c) =>
          c.bridge.category === args.category &&
          c.target.network === args.targetChain?.network &&
          c.target.symbol === args.targetToken?.symbol,
      );

    this.sourceChain = args.sourceChain;
    this.targetChain = args.targetChain;
    this.sourceToken = args.sourceToken;
    this.targetToken = args.targetToken;
    this.sourceNativeToken = args.sourceChain?.tokens.find(({ type }) => type === "native");
    this.targetNativeToken = args.targetChain?.tokens.find(({ type }) => type === "native");

    this.walletClient = args.walletClient;
    this.publicClient = args.publicClient;
    if (args.sourceChain) {
      if (isTronChain(args.sourceChain)) {
        this.sourceTronWebPublicClient = createTronPublicClient(args.sourceChain);
      } else {
        this.sourcePublicClient = createPublicClient({ chain: args.sourceChain, transport: http() });
      }
    }
    if (args.targetChain) {
      if (isTronChain(args.targetChain)) {
        this.targetTronWebPublicClient = createTronPublicClient(args.targetChain);
      } else {
        this.targetPublicClient = createPublicClient({ chain: args.targetChain, transport: http() });
      }
    }
  }

  protected initContractByBackingIssuing(backing: Address, issuing: Address) {
    if (this.crossInfo?.action === "issue") {
      this.contract = { sourceAddress: backing, targetAddress: issuing };
    } else if (this.crossInfo?.action === "redeem") {
      this.contract = { sourceAddress: issuing, targetAddress: backing };
    }
  }

  protected async getSigner() {
    if (this.walletClient) {
      return (await this.walletClient.getAddresses()).at(0);
    }
  }

  protected abstract _transfer(
    sender: Address,
    recipient: Address,
    amount: bigint,
    options?: TransferOptions & { askEstimateGas?: boolean },
  ): Promise<TransactionReceipt | TronTransactionReceipt | bigint | undefined>;

  getLogo() {
    return this.logo;
  }

  getName() {
    return this.name;
  }

  getContract() {
    return this.contract;
  }

  getSourceToken() {
    return this.sourceToken;
  }

  getTargetToken() {
    return this.targetToken;
  }

  getSourceChain() {
    return this.sourceChain;
  }

  getTargetChain() {
    return this.targetChain;
  }

  getCrossInfo() {
    return this.crossInfo;
  }

  getEstimateTime() {
    return this.estimateTime;
  }

  formatEstimateTime() {
    return `${this.estimateTime.min}~${this.estimateTime.max} Minutes`;
  }

  getTxGasLimit() {
    return this.sourceChain?.network === "arbitrum" || this.sourceChain?.network === "arbitrum-sepolia"
      ? 3000000n
      : undefined;
  }

  getApproveSpenderWhenTransfer() {
    if (this.sourceToken && this.sourceToken.type !== "native") {
      return this.convertor?.source ?? this.contract?.sourceAddress;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getFee(_?: GetFeeArgs): Promise<{ value: bigint; token: Token } | undefined> {
    return undefined;
  }

  async getDailyLimit(): Promise<{ limit: bigint; spent: bigint; token: Token } | undefined> {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async claim(_record: HistoryRecord): Promise<TransactionReceipt | undefined> {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async refund(_record: HistoryRecord): Promise<TransactionReceipt | TronTransactionReceipt | undefined> {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async speedUp(_record: HistoryRecord, _newFee: bigint): Promise<TransactionReceipt | undefined> {
    return undefined;
  }

  async getSourceBalance(address: Address) {
    if (this.sourceToken && this.sourcePublicClient) {
      return getBalance(address, this.sourceToken, this.sourcePublicClient);
    }
  }

  async getTargetBalance(address: Address) {
    if (this.targetToken && this.targetPublicClient) {
      return getBalance(address, this.targetToken, this.targetPublicClient);
    }
  }

  private async getAllowance(
    owner: Address,
    spender: Address,
    token: Token,
    api: { publicClient?: ViemPublicClient; tronWeb?: TronWebClient },
  ) {
    if (token.type === "erc20") {
      if (api.publicClient) {
        const value = await api.publicClient.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: "allowance",
          args: [owner, spender],
        });
        return { value, token };
      } else if (api.tronWeb) {
        const contract = await api.tronWeb.contract(erc20Abi, convertAddressToTron(token.address));
        const a = await contract.allowance(convertAddressToTron(owner), convertAddressToTron(spender)).call();
        return { value: BigInt(a.toString()), token };
      }
    }
  }

  async getSourceAllowance(owner: Address) {
    if (this.contract && this.sourceToken) {
      const spender = this.convertor?.source ?? this.contract.sourceAddress;
      return this.getAllowance(owner, spender, this.sourceToken, {
        publicClient: this.sourcePublicClient,
        tronWeb: this.sourceTronWebPublicClient,
      });
    }
  }

  async getTargetAllowance(owner: Address) {
    if (this.contract && this.targetToken) {
      const spender = this.convertor?.target ?? this.contract.targetAddress;
      return this.getAllowance(owner, spender, this.targetToken, {
        publicClient: this.targetPublicClient,
        tronWeb: this.targetTronWebPublicClient,
      });
    }
  }

  private async approve(amount: bigint, owner: Address, spender: Address, token: Token, chain: ChainConfig) {
    if (isTronChain(chain)) {
      const tronWeb = createTronWalletClient();
      if (tronWeb) {
        const contract = await tronWeb.contract(erc20Abi, convertAddressToTron(token.address));
        const hash = await contract.approve(convertAddressToTron(owner), amount.toString()).send();
        const receipt = waitForTronTransactionReceipt({ client: tronWeb, hash });
        return receipt;
      }
    } else if (this.publicClient && this.walletClient) {
      const { request } = await this.publicClient.simulateContract({
        address: token.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, amount],
        account: owner,
      });
      const hash = await this.walletClient.writeContract(request);
      return this.publicClient.waitForTransactionReceipt({ hash, confirmations: TX_CONFIRMATIONS });
    }
  }

  async sourceApprove(amount: bigint, owner: Address) {
    if (this.sourceToken && this.contract && this.sourceChain) {
      const spender = this.convertor?.source ?? this.contract.sourceAddress;
      return this.approve(amount, owner, spender, this.sourceToken, this.sourceChain);
    }
  }

  async targetApprove(amount: bigint, owner: Address) {
    if (this.targetToken && this.contract && this.targetChain) {
      const spender = this.convertor?.target ?? this.contract.targetAddress;
      return this.approve(amount, owner, spender, this.targetToken, this.targetChain);
    }
  }

  async transfer(sender: Address, recipient: Address, amount: bigint, options?: TransferOptions) {
    return this._transfer(sender, recipient, amount, options) as Promise<
      TransactionReceipt | TronTransactionReceipt | undefined
    >;
  }

  async estimateTransferGas(sender: Address, recipient: Address, amount: bigint, options?: TransferOptions) {
    return this._transfer(sender, recipient, amount, { ...options, askEstimateGas: true }) as Promise<
      bigint | undefined
    >;
  }

  async estimateTransferGasFee(sender: Address, recipient: Address, amount: bigint, options?: TransferOptions) {
    const estimateGas = await this.estimateTransferGas(sender, recipient, amount, options);
    if (estimateGas && this.sourcePublicClient) {
      const { maxFeePerGas } = await this.sourcePublicClient.estimateFeesPerGas();
      return maxFeePerGas ? maxFeePerGas * estimateGas : undefined;
    }
  }
}
