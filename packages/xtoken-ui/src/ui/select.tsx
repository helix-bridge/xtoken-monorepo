import {
  FloatingPortal,
  Placement,
  offset,
  size,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import { PropsWithChildren, ReactElement } from "react";

interface Props {
  isOpen: boolean;
  label?: ReactElement;
  placeholder: ReactElement;
  disabled?: boolean;
  hoverable?: boolean;
  clearable?: boolean;
  sameWidth?: boolean;
  placement?: Placement;
  offsetSize?: number;
  labelClassName?: string;
  childClassName?: string;
  onClear?: () => void;
  onOpenChange: (isOpen: boolean) => void;
}

export default function Select({
  label,
  isOpen,
  placeholder,
  disabled,
  children,
  hoverable,
  clearable,
  placement,
  sameWidth,
  offsetSize,
  labelClassName,
  childClassName,
  onClear = () => undefined,
  onOpenChange = () => undefined,
}: PropsWithChildren<Props>) {
  const { refs, context, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange,
    placement,
    middleware: [
      offset(offsetSize ?? 4),
      sameWidth
        ? size({
            apply({ rects, elements }) {
              Object.assign(elements.floating.style, { width: `${rects.reference.width}px` });
            },
          })
        : undefined,
    ],
  });

  const { styles, isMounted } = useTransitionStyles(context, {
    initial: { transform: "translateY(-10px)", opacity: 0 },
    open: { transform: "translateY(0)", opacity: 1 },
    close: { transform: "translateY(-10px)", opacity: 0 },
  });

  const hover = useHover(context, { enabled: !!hoverable });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, click, dismiss]);

  return (
    <>
      <button
        className={`disabled:cursor-not-allowed disabled:opacity-60 ${labelClassName}`}
        ref={refs.setReference}
        {...getReferenceProps()}
        disabled={disabled}
      >
        {label || placeholder}
        <div
          className={`gap-small flex shrink-0 items-center transition-transform group-hover:-translate-x-2 ${isOpen ? "-translate-x-2" : ""}`}
        >
          {label && clearable ? (
            <div
              className="relative h-[16px] w-[16px] shrink-0 rounded-full bg-transparent p-[2px] opacity-80 transition hover:scale-105 hover:bg-white/20 hover:opacity-100 active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            >
              <img alt="Close" className="h-full w-full" src="images/close.svg" />
            </div>
          ) : null}
          <img
            style={{ transform: isOpen ? "rotateX(180deg)" : "rotateX(0)" }}
            className="shrink-0 transition-transform"
            src="images/caret-down.svg"
            alt="Caret down"
            width={16}
            height={16}
          />
        </div>
      </button>

      {isMounted && (
        <FloatingPortal>
          <div style={floatingStyles} ref={refs.setFloating} {...getFloatingProps()} className="z-20">
            <div className={`${childClassName}`} style={styles} onClick={() => onOpenChange(false)}>
              {children}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
