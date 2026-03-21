import { RuleConfig, RuleType } from '../types';
import {
  Plus,
  Replace,
  Hash,
  CaseLower,
  CaseUpper,
  X,
} from 'lucide-react';

interface RuleCardProps {
  rule: RuleConfig;
  onUpdate: (updates: Partial<RuleConfig>) => void;
  onRemove: () => void;
}

const inputClass =
  'w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-surface focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent placeholder:text-text-tertiary transition-colors';

const labels: Record<RuleType, string> = {
  prefix: 'Prefix',
  suffix: 'Suffix',
  replace: 'Find & Replace',
  autonumber: 'Auto-Number',
  case: 'Change Case',
};

const icons: Record<RuleType, React.ReactNode> = {
  prefix: <Plus className="w-3 h-3" />,
  suffix: <Plus className="w-3 h-3" />,
  replace: <Replace className="w-3 h-3" />,
  autonumber: <Hash className="w-3 h-3" />,
  case: <CaseLower className="w-3 h-3" />,
};

export default function RuleCard({ rule, onUpdate, onRemove }: RuleCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-text-accent">
          {icons[rule.type]}
          <span className="text-[11px] font-semibold uppercase tracking-wider">{labels[rule.type]}</span>
        </div>
        <button
          onClick={onRemove}
          className="p-0.5 rounded hover:bg-surface-hover transition-colors cursor-pointer"
          aria-label="Remove rule"
        >
          <X className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary" />
        </button>
      </div>

      {rule.type === 'prefix' && (
        <input type="text" placeholder="Text to add before filename..." aria-label="Prefix text" value={rule.prefix} onChange={(e) => onUpdate({ prefix: e.target.value })} className={inputClass} />
      )}

      {rule.type === 'suffix' && (
        <input type="text" placeholder="Text to add after filename..." aria-label="Suffix text" value={rule.suffix} onChange={(e) => onUpdate({ suffix: e.target.value })} className={inputClass} />
      )}

      {rule.type === 'replace' && (
        <div className="space-y-2">
          <input type="text" placeholder="Find..." aria-label="Search text" value={rule.searchText} onChange={(e) => onUpdate({ searchText: e.target.value })} className={inputClass} />
          <input type="text" placeholder="Replace with..." aria-label="Replace text" value={rule.replaceText} onChange={(e) => onUpdate({ replaceText: e.target.value })} className={inputClass} />
        </div>
      )}

      {rule.type === 'autonumber' && (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] font-medium text-text-tertiary mb-1 block uppercase tracking-wider">Start</label>
            <input type="number" min={0} aria-label="Starting number" value={rule.startNum} onChange={(e) => onUpdate({ startNum: parseInt(e.target.value, 10) || 0 })} className={inputClass} />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-medium text-text-tertiary mb-1 block uppercase tracking-wider">Digits</label>
            <input type="number" min={1} max={10} aria-label="Number of digits (padding)" value={rule.padding} onChange={(e) => onUpdate({ padding: parseInt(e.target.value, 10) || 3 })} className={inputClass} />
          </div>
        </div>
      )}

      {rule.type === 'case' && (
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate({ caseMode: 'lower' })}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-colors cursor-pointer ${
              rule.caseMode === 'lower'
                ? 'border-accent bg-accent-subtle text-text-accent font-medium'
                : 'border-border text-text-secondary hover:bg-surface-hover'
            }`}
          >
            <CaseLower className="w-3.5 h-3.5" />
            lowercase
          </button>
          <button
            onClick={() => onUpdate({ caseMode: 'upper' })}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-colors cursor-pointer ${
              rule.caseMode === 'upper'
                ? 'border-accent bg-accent-subtle text-text-accent font-medium'
                : 'border-border text-text-secondary hover:bg-surface-hover'
            }`}
          >
            <CaseUpper className="w-3.5 h-3.5" />
            UPPERCASE
          </button>
        </div>
      )}
    </div>
  );
}
