import React from "react";
import { cn } from "../../lib/utils";

/** Section with a subtle heading — no uppercase, medium weight only */
export const PropertySection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={cn("space-y-4 pb-6 border-b border-app-border/40 last:border-0", className)}>
    <h4 className="text-ui-sm font-medium text-app-text leading-none tracking-normal">{title}</h4>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

/** Field label — muted, regular weight, never uppercase */
export const FieldLabel: React.FC<{ children: React.ReactNode; action?: React.ReactNode }> = ({ children, action }) => (
  <div className="flex justify-between items-center mb-1.5">
    <label className="text-ui-micro text-app-muted font-normal leading-none">{children}</label>
    {action}
  </div>
);

/** Inline reset link — accent color, small, understated */
export const ResetLink: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label = "Reset" }) => (
  <button onClick={onClick} className="text-ui-micro text-app-accent hover:underline font-normal">
    {label}
  </button>
);

/** Unified Color Picker with Hex and Alpha support */
export const UnifiedColorPicker: React.FC<{ 
  label: string; 
  value: string | undefined; 
  onChange: (val: string | undefined) => void;
  action?: React.ReactNode;
  placeholder?: string;
}> = ({ label, value, onChange, action, placeholder = "FFFFFF" }) => {
  const valStr = typeof value === 'string' ? value : "";
  const hexPart = valStr.startsWith('#') ? valStr.substring(0, 7).toUpperCase() : (valStr || "#FFFFFF").toUpperCase();
  const alphaPercent = valStr.length === 9 && valStr.startsWith('#')
    ? Math.round((parseInt(valStr.substring(7, 9), 16) / 255) * 100)
    : 100;

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim().toUpperCase();
    if (!raw) { onChange(undefined); return; }
    let hex = raw.startsWith('#') ? raw : `#${raw}`;
    if (hex.length > 7) hex = hex.substring(0, 7);
    
    const curAlpha = valStr.length === 9 ? valStr.substring(7, 9) : 'FF';
    onChange(curAlpha === 'FF' ? hex : `${hex}${curAlpha}`);
  };

  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = parseInt(e.target.value);
    if (isNaN(v)) v = 100;
    v = Math.max(0, Math.min(100, v));
    const aHex = Math.round((v / 100) * 255).toString(16).padStart(2, '0').toUpperCase();
    const base = valStr.startsWith('#') ? valStr.substring(0, 7) : (valStr || "#FFFFFF");
    onChange(aHex === 'FF' ? base : `${base}${aHex}`);
  };

  return (
    <div>
      <FieldLabel action={action}>{label}</FieldLabel>
      <div className="flex bg-app-bg border border-app-border rounded-md overflow-hidden h-8 group focus-within:border-app-accent/50 transition-colors">
        <div className="relative w-8 shrink-0 flex items-center justify-center border-r border-app-border cursor-pointer bg-app-sidebar/30">
          <div
            className="w-4 h-4 rounded-sm shadow-sm border border-black/10"
            style={{ backgroundColor: hexPart.length === 7 ? hexPart : '#FFFFFF' }}
          />
          <input
            type="color"
            value={hexPart.length === 7 ? hexPart : '#FFFFFF'}
            onChange={e => {
              const curAlpha = valStr.length === 9 ? valStr.substring(7, 9) : 'FF';
              onChange(e.target.value.toUpperCase() + (curAlpha === 'FF' ? '' : curAlpha));
            }}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          />
        </div>
        <input
          value={hexPart.replace('#', '')}
          onChange={handleHexChange}
          placeholder={placeholder.replace('#', '')}
          className="flex-1 bg-transparent px-2.5 text-ui-xs font-mono outline-none text-app-text min-w-0 placeholder:text-app-muted/30"
        />
        <div className="w-[60px] flex items-center border-l border-app-border px-1.5 gap-0.5 bg-app-sidebar/10">
          <input
            type="text"
            value={alphaPercent}
            onChange={handleAlphaChange}
            className="w-full bg-transparent text-ui-xs text-right font-mono outline-none text-app-text"
          />
          <span className="text-[10px] text-app-muted font-mono mt-0.5 shrink-0 select-none">%</span>
        </div>
      </div>
    </div>
  );
};
