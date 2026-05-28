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
        地点标注
        <span className="ml-1 font-normal text-slate-400">（建议填写，便于汇总）</span>
      </label>
      <input
        id="record-location"
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例如：XX 地铁 3 号口北侧、XX 商场东门"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
      />
    </div>
  );
}
