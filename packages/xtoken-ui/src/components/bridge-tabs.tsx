import { Key, ReactElement } from "react";

export interface TabsProps<T> {
  activeTab: T;
  options: {
    tab: T;
    label: string;
    children: ReactElement;
  }[];
  onChange?: (tab: T) => void;
}

export default function BridgeTabs<K extends Key = string>({
  options,
  activeTab,
  onChange = () => undefined,
}: TabsProps<K>) {
  const activeItem = options.find(({ tab }) => tab === activeTab) || options[0];

  return (
    <>
      <div className="gap-medium bg-background flex items-center justify-between rounded-xl p-2">
        {options.map((option) => (
          <button
            key={option.tab}
            disabled={option.tab === activeTab || options.length === 1}
            onClick={() => onChange(option.tab)}
            className={`h-9 flex-1 rounded-lg text-sm font-bold text-white transition-colors  ${options.length === 1 ? "" : "hover:bg-white/10 disabled:bg-white/20"}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="gap-medium flex flex-col lg:gap-5">{activeItem.children}</div>
    </>
  );
}
