"use client";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function LocationInput({
  value,
  onChange,
  disabled = false,
}: LocationInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="record-location" className="text-sm font-medium text-slate-700">
        哪条路 / 哪个位置
        <span className="ml-1 font-normal text-slate-400">（建议填写路名或地标，诊断才能对应到具体路段）</span>
      </label>
      <input
        id="record-location"
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例如：XX 路 XX 段北侧便道、XX 地铁 3 号口东侧"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
      />
    </div>
  );
}
