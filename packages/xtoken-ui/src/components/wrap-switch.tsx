type Value = "ring" | "kton";

interface Props {
  value: Value;
  onChange: (value: Value) => void;
}

export default function WrapSwitch({ value, onChange }: Props) {
  return (
    <div className="bg-secondary relative flex items-center rounded-full p-1">
      <div
        className="bg-primary absolute left-1 top-1 inline-flex h-6 w-12 items-center justify-center rounded-full transition-transform"
        style={{ transform: value === "ring" ? "translate(0, 0)" : "translate(3rem, 0)" }}
      >
        <span className="text-sm font-bold uppercase text-white/90">{value === "ring" ? "RING" : "KTON"}</span>
      </div>

      <span
        className="inline-flex h-6 w-12 items-center justify-center text-sm font-normal text-white/50 transition-colors hover:cursor-pointer hover:text-white"
        onClick={() => onChange("ring")}
      >
        RING
      </span>
      <span
        className="inline-flex h-6 w-12 items-center justify-center text-sm font-normal text-white/50 transition-colors hover:cursor-pointer hover:text-white"
        onClick={() => onChange("kton")}
      >
        KTON
      </span>
    </div>
  );
}
