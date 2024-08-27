import { getChainConfigs, getChainLogoSrc, isTronChain } from "../utils";
import {
  FloatingPortal,
  Placement,
  offset,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import { useMemo, useState } from "react";
import { useNetwork } from "wagmi";
import { tronWalletChainIdAtom } from "../store/tronwallet";
import { useAtomValue } from "jotai";
import { useWallet } from "../hooks";
import { selectedSourceChainAtom } from "../store/chain";

const chainOptions = getChainConfigs();

export default function ChainSwitch({ placement }: { placement?: Placement }) {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, context, floatingStyles } = useFloating({
    placement,
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(6)],
  });
  const { styles, isMounted } = useTransitionStyles(context, {
    initial: { transform: "translateY(-10px)", opacity: 0 },
    open: { transform: "translateY(0)", opacity: 1 },
    close: { transform: "translateY(-10px)", opacity: 0 },
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  const { chain } = useNetwork();
  const { addressForSelectedSourceChain, switchChain } = useWallet();

  const selectedSourceChain = useAtomValue(selectedSourceChainAtom);
  const tronWalletChainId = useAtomValue(tronWalletChainIdAtom);
  const activeChain = useMemo(() => {
    if (selectedSourceChain) {
      if (isTronChain(selectedSourceChain)) {
        return chainOptions.find((c) => c.id === tronWalletChainId);
      } else {
        return chainOptions.find((c) => c.id === chain?.id);
      }
    }
    return undefined;
  }, [chain?.id, selectedSourceChain, tronWalletChainId]);

  return addressForSelectedSourceChain ? (
    <>
      <button
        className="px-large lg:bg-secondary flex h-9 w-fit items-center justify-between gap-2 rounded-xl bg-white/10 transition-colors hover:bg-white/20 lg:h-8"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        {activeChain ? (
          <>
            <img
              alt="Active chain"
              width={20}
              height={20}
              src={getChainLogoSrc(activeChain.logo)}
              className="rounded-full"
            />
            <img
              style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
              className="shrink-0 transition-transform"
              src="images/caret-down.svg"
              alt="Caret down"
              width={16}
              height={16}
            />
          </>
        ) : (
          <>
            <img alt="Wrong chain" width={18} height={18} src="images/warning.svg" />
            <span className="text-sm font-bold text-orange-400">Wrong Chain</span>
          </>
        )}
      </button>

      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-20">
            <div
              style={styles}
              className="app-scrollbar bg-background flex max-h-[18rem] flex-col overflow-y-auto rounded-xl border border-white/20 py-2"
              onClick={() => setIsOpen(false)}
            >
              {chainOptions
                .filter((option) =>
                  selectedSourceChain && isTronChain(selectedSourceChain) ? isTronChain(option) : !isTronChain(option),
                )
                .map((option) => (
                  <button
                    className="gap-medium px-large py-medium flex items-center transition-colors hover:bg-white/5 disabled:bg-white/10"
                    disabled={option.id === chain?.id}
                    key={option.id}
                    onClick={() => {
                      switchChain(option);
                    }}
                  >
                    <img
                      alt="Chain"
                      width={20}
                      height={20}
                      src={getChainLogoSrc(option.logo)}
                      className="rounded-full"
                    />
                    <span className="text-sm font-bold text-white">{option.name}</span>
                  </button>
                ))}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  ) : null;
}
