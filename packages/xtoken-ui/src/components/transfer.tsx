import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import TransferTokenSection from "./transfer-token-section";
import {
  bridgeFactory,
  getSourceTokenOptions,
  getTargetTokenOptions,
  getTokenOptions,
  isTronChain,
  isTxSuccess,
  notifyError,
  notifyTransaction,
} from "../utils";
import TransferChainSection from "./transfer-chain-section";
import TransferAmountSection from "./transfer-amount-section";
import TransferInformationSection from "./transfer-information-section";
import Button from "../ui/button";
import { useAllowance, useApp, useBalance, useDailyLimit, useMessageFee, useTransfer, useWallet } from "../hooks";
import { usePublicClient, useWalletClient } from "wagmi";
import TransferProvider from "../providers/transfer-provider";
import { Address } from "viem";
import TransferModalV2 from "./modals/transfer-modal-v2";
import BridgeTabs from "./bridge-tabs";
import ThirdPartyBridge from "./third-party-bridge";

interface Recipient {
  input: string;
  value: Address | undefined;
  alert?: string;
}

enum BridgeTab {
  OFFICIAL,
  THIRD_PARTY,
}

const IS_BRIDGE_UNDER_MAINTENANCE = true;

function Component() {
  const { updateBalanceAll, setIsHistoryOpen, setHistoryDetails } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isTransfering, setIsTransfering] = useState(false);
  const [bridgeTab, setBridgeTab] = useState(BridgeTab.OFFICIAL);
  const {
    amount,
    token,
    sourceChain,
    sourceToken,
    targetChain,
    targetToken,
    sourceChainOptions,
    targetChainOptions,
    setAmount,
    isSwitchAvailable,
    handleTokenChange,
    handleSourceChainChange,
    handleSourceTokenChange,
    handleTargetChainChange,
    handleTargetTokenChange,
    handleSwitch,
  } = useTransfer();
  const deferredAmount = useDeferredValue(amount);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { addressForSelectedSourceChain, needSwitchChain, connectWallet, switchChain } = useWallet();

  const [recipient, setRecipient] = useState<Recipient>({
    input: "",
    value: undefined,
    alert: undefined,
  });
  const [expandRecipient, setExpandRecipient] = useState(false);
  useEffect(() => {
    if (addressForSelectedSourceChain) {
      if (isTronChain(sourceChain) || isTronChain(targetChain)) {
        setRecipient({ input: "", value: undefined, alert: "* Require recipient" });
        setExpandRecipient(true);
      } else {
        setRecipient((prev) =>
          prev.input?.startsWith("0x")
            ? prev
            : { input: addressForSelectedSourceChain, value: addressForSelectedSourceChain, alert: undefined },
        );
        setExpandRecipient(false);
      }
    } else {
      setRecipient({ input: "", value: undefined, alert: undefined });
      setExpandRecipient(false);
    }
  }, [addressForSelectedSourceChain, sourceChain, targetChain]);
  const handleRecipientChange = useCallback((value: Recipient) => {
    setRecipient(value);
  }, []);
  const handleExpandRecipient = useCallback(() => setExpandRecipient((prev) => !prev), []);

  const {
    balance,
    loading: loadingBalance,
    refresh: refreshBalance,
  } = useBalance(sourceChain, sourceToken, addressForSelectedSourceChain);

  const [bridge, cross] = useMemo(() => {
    const cross = sourceToken.cross.find(
      (c) => !c.hidden && c.target.network === targetChain.network && c.target.symbol === targetToken.symbol,
    );
    const bridge = cross
      ? bridgeFactory({
          category: cross.bridge.category,
          walletClient,
          publicClient,
          sourceChain,
          sourceToken,
          targetChain,
          targetToken,
        })
      : undefined;
    return [bridge, cross];
  }, [publicClient, sourceChain, sourceToken, targetChain, targetToken, walletClient]);

  const { loading: loadingDailyLimit, dailyLimit } = useDailyLimit(bridge);
  const { loading: loadingFee, fee } = useMessageFee(
    bridge,
    addressForSelectedSourceChain,
    addressForSelectedSourceChain,
    deferredAmount.value,
  );

  const {
    allowance,
    loading: loadingAllowance,
    busy: isApproving,
    approve,
    refresh: refreshAllowance,
  } = useAllowance(sourceChain, sourceToken, addressForSelectedSourceChain, bridge?.getApproveSpenderWhenTransfer());

  const [actionText, disableAction] = useMemo(() => {
    let text: "Connect Wallet" | "Switch Chain" | "Approve" | "Deposit" | "Withdraw" = "Deposit";
    let disabled = false;

    if (!addressForSelectedSourceChain) {
      text = "Connect Wallet";
      disabled = false;
    } else if (needSwitchChain(sourceChain)) {
      text = "Switch Chain";
      disabled = false;
    } else if (
      allowance < (fee?.token.type === "native" ? deferredAmount.value : deferredAmount.value + (fee?.value ?? 0n))
    ) {
      text = "Approve";
      disabled = false;
    } else {
      text = cross?.action === "redeem" ? "Withdraw" : "Deposit";
      disabled =
        loadingAllowance ||
        fee?.value === undefined ||
        !deferredAmount.input ||
        !deferredAmount.valid ||
        !recipient.value ||
        !!recipient.alert;
    }

    return [text, disabled];
  }, [
    addressForSelectedSourceChain,
    allowance,
    cross?.action,
    deferredAmount,
    fee?.token.type,
    fee?.value,
    loadingAllowance,
    needSwitchChain,
    recipient,
    sourceChain,
  ]);

  const handleAction = useCallback(async () => {
    if (actionText === "Connect Wallet") {
      connectWallet(sourceChain);
    } else if (actionText === "Switch Chain") {
      switchChain(sourceChain);
    } else if (actionText === "Approve") {
      const receipt = await approve(
        fee?.token.type === "native" ? deferredAmount.value : deferredAmount.value + (fee?.value ?? 0n),
      );
      notifyTransaction(receipt, sourceChain, "Approval");
    } else if (actionText === "Deposit" || actionText === "Withdraw") {
      setIsOpen(true);
    }
  }, [actionText, approve, connectWallet, deferredAmount.value, fee?.token.type, fee?.value, sourceChain, switchChain]);

  const handleTransfer = useCallback(async () => {
    const sender = addressForSelectedSourceChain;
    if (bridge && sender && recipient.value) {
      try {
        setIsTransfering(true);
        const receipt = await bridge.transfer(sender, recipient.value, deferredAmount.value, {
          totalFee: fee?.value,
        });
        notifyTransaction(receipt, sourceChain, "Transfer");
        setIsTransfering(false);
        if (isTxSuccess(receipt) && receipt) {
          const requestTxHash = ("status" in receipt ? receipt.transactionHash : `0x${receipt.txID}`) as Address;
          setAmount({ input: "", valid: true, value: 0n, alert: "" });
          setHistoryDetails({
            requestTxHash,
            fromChain: sourceChain?.network,
            toChain: targetChain?.network,
            sendToken: bridge.getSourceToken()?.symbol,
            sendAmount: deferredAmount.value.toString(),
          });
          setIsOpen(false);
          setIsHistoryOpen(true);
          refreshBalance();
          refreshAllowance();
          updateBalanceAll();
        }
      } catch (err) {
        console.error(err);
        notifyError(err);
        setIsTransfering(false);
      }
    }
  }, [
    addressForSelectedSourceChain,
    bridge,
    deferredAmount.value,
    fee?.value,
    recipient.value,
    refreshAllowance,
    refreshBalance,
    setAmount,
    setHistoryDetails,
    setIsHistoryOpen,
    sourceChain,
    updateBalanceAll,
    targetChain?.network,
  ]);

  return (
    <>
      <div className="gap-medium p-medium flex w-full flex-col rounded-3xl bg-[#1F282C] lg:w-[27.5rem] lg:gap-5 lg:rounded-[2rem] lg:p-5">
        <TransferTokenSection token={token} options={getTokenOptions()} onChange={handleTokenChange} />
        <TransferChainSection
          recipient={recipient}
          expandRecipient={expandRecipient}
          recipientOptions={addressForSelectedSourceChain ? [addressForSelectedSourceChain] : []}
          sourceChain={sourceChain}
          targetChain={targetChain}
          sourceToken={sourceToken}
          targetToken={targetToken}
          sourceChainOptions={sourceChainOptions}
          targetChainOptions={targetChainOptions}
          disableSwitch={!isSwitchAvailable(sourceChain, targetChain)}
          sourceTokenOptions={getSourceTokenOptions(sourceChain, token.category)}
          targetTokenOptions={getTargetTokenOptions(sourceToken, targetChain)}
          onSourceChainChange={handleSourceChainChange}
          onSourceTokenChange={handleSourceTokenChange}
          onTargetChainChange={handleTargetChainChange}
          onTargetTokenChange={handleTargetTokenChange}
          onSwitch={handleSwitch}
          onRecipientChange={handleRecipientChange}
          onExpandRecipient={handleExpandRecipient}
        />
        <BridgeTabs<BridgeTab>
          options={[
            ...(cross?.onlyThirdParty
              ? []
              : [
                  {
                    children: IS_BRIDGE_UNDER_MAINTENANCE ? (
                      <div className="bg-background rounded-xl p-2">
                        <p className="text-sm font-normal text-yellow-400">
                          ⚠️ The bridge feature is currently under maintenance. We are working to restore it as soon as
                          possible. Thank you for your patience.
                        </p>
                      </div>
                    ) : (
                      <>
                        <TransferAmountSection
                          amount={amount}
                          loading={loadingBalance}
                          balance={balance}
                          token={sourceToken}
                          chain={sourceChain}
                          min={bridge?.getCrossInfo()?.min}
                          max={dailyLimit?.limit}
                          onChange={setAmount}
                          onRefresh={refreshBalance}
                        />
                        <TransferInformationSection
                          bridge={bridge}
                          fee={fee}
                          dailyLimit={dailyLimit}
                          isLoadingFee={loadingFee}
                          isLoadingDailyLimit={loadingDailyLimit}
                        />

                        <div className="flex flex-col items-center gap-2 lg:gap-3">
                          <Button
                            className="inline-flex h-12 w-full items-center justify-center rounded-full"
                            kind="primary"
                            busy={isApproving}
                            disabled={disableAction}
                            onClick={handleAction}
                          >
                            <span className="text-base font-bold text-white">{actionText}</span>
                          </Button>
                          <span className="text-xs font-semibold text-white/50">
                            © {new Date().getFullYear()} Powered by{" "}
                            <a
                              href="https://xtoken.box"
                              rel="noopener noreferrer"
                              target="_blank"
                              className="text-primary hover:underline"
                            >
                              XToken
                            </a>
                          </span>
                        </div>
                      </>
                    ),
                    tab: BridgeTab.OFFICIAL,
                    label: "Official Bridge",
                  },
                ]),
            ...(cross?.thirdPartyBridges?.length
              ? [
                  {
                    children: <ThirdPartyBridge data={cross.thirdPartyBridges} />,
                    tab: BridgeTab.THIRD_PARTY,
                    label: "Third Party Bridges",
                  },
                ]
              : []),
          ]}
          activeTab={bridgeTab}
          onChange={setBridgeTab}
        />
      </div>

      <TransferModalV2
        sender={addressForSelectedSourceChain}
        recipient={recipient.value}
        sourceChain={sourceChain}
        sourceToken={sourceToken}
        targetChain={targetChain}
        targetToken={targetToken}
        fee={fee}
        bridge={bridge}
        amount={deferredAmount.value}
        busy={isTransfering}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleTransfer}
      />
    </>
  );
}

export default function Transfer() {
  return (
    <TransferProvider>
      <Component />
    </TransferProvider>
  );
}
