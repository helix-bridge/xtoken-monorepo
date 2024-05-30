import { ChainConfig } from "../types";
import Select from "../ui/select";
import { getChainLogoSrc } from "../utils";
import { Placement } from "@floating-ui/react";

interface Props {
  options?: ChainConfig[];
  value?: ChainConfig;
  placeholder?: string;
  compact?: boolean;
  placement?: Placement;
  className?: string;
  onChange?: (value: ChainConfig | undefined) => void;
}

export default function ChainSelect({
  value,
  placeholder,
  compact,
  placement,
  className,
  options = [],
  onChange = () => undefined,
}: Props) {
  return (
    <Select
      labelClassName={`gap-small rounded-xl flex items-center justify-between transition active:translate-y-1 ${className}`}
      childClassName={`bg-inner flex flex-col rounded-xl max-h-60 overflow-y-auto border border-component ${
        compact ? "py-small" : "p-medium"
      }`}
      label={
        value ? (
          <div className="gap-medium flex items-center truncate">
            {compact ? null : (
              <img
                alt="Chain"
                width={32}
                height={32}
                src={getChainLogoSrc(value.logo)}
                className="h-8 w-8 shrink-0 rounded-full"
              />
            )}

            <span className="truncate text-sm font-extrabold text-white">{value.name}</span>
          </div>
        ) : undefined
      }
      placeholder={<span className="truncate text-sm font-medium text-slate-400">{placeholder}</span>}
      placement={placement}
      sameWidth={compact ? true : false}
      clearable={compact ? true : false}
      onClear={() => onChange(undefined)}
    >
      {options.length ? (
        compact ? (
          options.map((option) => {
            return (
              <button
                key={option.id}
                onClick={() => onChange(option)}
                className="gap-medium px-large flex items-center py-2 text-start transition-colors hover:bg-white/10"
              >
                <img
                  width={20}
                  height={20}
                  alt="Chain logo"
                  src={getChainLogoSrc(option.logo)}
                  className="rounded-full"
                />
                <span className="truncate text-sm font-bold text-white">{option.name}</span>
              </button>
            );
          })
        ) : (
          <div className="gap-small grid grid-cols-2">
            {options.map((option) => (
              <button
                key={option.id}
                className="gap-small rounded-medium bg-component flex w-36 shrink-0 items-center truncate px-2 py-2 transition-colors hover:bg-white/20"
                onClick={() => onChange(option)}
              >
                <img
                  width={20}
                  height={20}
                  alt="Chain logo"
                  src={getChainLogoSrc(option.logo)}
                  className="rounded-full"
                />
                <span className="truncate text-sm font-bold text-white">{option.name}</span>
              </button>
            ))}
          </div>
        )
      ) : (
        <div className="px-large py-small">
          <span className="text-sm text-white/50">No data</span>
        </div>
      )}
    </Select>
  );
}
